/**
 * makecode I2C LCD1602 package for microbit.
 * From microbit/micropython Chinese community.
 * http://www.micropython.org.cn
 */

enum ModuleIndex {
    //% block="module1"
    Module1,
    //% block="module2"
    Module2,
    //% block="module3"
    Module3,
    //% block="module4"
    Module4
}
enum ADCIndex {
    //% block="A1"
    CH1,
    //% block="A2"
    CH2,
    //% block="A3"
    CH3,
    //% block="A4"
    CH4
}
enum DigitalInPinIndex {
    //% block="1"
    P10,
    //% block="2"
    P11,
    //% block="3"
    P16,
    //% block="4"
    P17
}
enum DigitalOutputPinIndex {
    //% block="1"
    P10,
    //% block="2"
    P11,
    //% block="3"
    P16,
    //% block="4"
    P17,
    //% block="5"
    P35,
    //% block="6"
    P36
}
enum DigitalOutputIndex {
    //% block="LOW"
    LOW,
    //% block="HIGH"
    HIGH
}
enum THMesure {
    //% block="humidity"
    humidity,
    //% block="temperature"
    temperature,
}
function validate(str: String): Boolean {
    let isfloat = false;
    let len = str.length;
    if (len > 5) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if (str.charAt(i) == ".") {
            isfloat = true;
            return true;
        }
    }
    if (!isfloat && len == 5) {
        return false;
    }
    return true;
}
/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon=""    
namespace cookieModules {
    const PM_ADDRESS = 0x26//电位器26-29//3031不好用
    const SEG_ADDRESS = 0x32//数码管32-35
    const DigitalIn_ADDRESS = 0x36//单个//
    const DigitalOutPut_ADDRESS = 0x37//单个//
    const ADC_ADDRESS = 0x40//单个
    const SONAR_ADDRESS = 0x52//52-55//
    const HM_ADDRESS = 0x41//41-44
    const PH_ADDRESS = 0x45//45-48
    const TURBIDITY_ADDRESS = 0x52//52-55
    const SOILMOISTURE_ADDRESS = 0x56//56-59
    //将字符串格式化为UTF8编码的字节
    let writeUTF = function (str: String, isGetBytes?: boolean) {
        let back = [];
        let byteSize = 0;
        let i = 0;
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (0x00 <= code && code <= 0x7f) {
                byteSize += 1;
                back.push(code);
            } else if (0x80 <= code && code <= 0x7ff) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)))
            } else if ((0x800 <= code && code <= 0xd7ff)
                || (0xe000 <= code && code <= 0xffff)) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)))
            }
        }
        for (i = 0; i < back.length; i++) {
            back[i] &= 0xff;
        }
        return back;

    }
    //限幅
    function constract(val: number, minVal: number, maxVal: number): number {
        if (val > maxVal) {
            return maxVal;
        } else if (val < minVal) {
            return minVal;
        }
        return val;
    }
    //有效性判断
    function validate(str: String): Boolean {
        let isfloat = false;
        let len = str.length;
        if (len > 5) {//长度大于5
            return false;//错误
        }
        for (let i = 0; i < len; i++) {//有没有小数点
            if (str.charAt(i) == ".") {
                isfloat = true;//有小数点的话，是浮点数且返回是
                return true;
            }
        }
        if (!isfloat && len == 5) {//若不是浮点，却长度等于5.返回错误
            return false;
        }
        return true;
    } 
    function i2cWriteRegister(address: number, register: number, value: number, valueFormat?: NumberFormat): void {
        if (valueFormat === undefined)
            valueFormat = NumberFormat.UInt8LE;
        const valueSize = pins.sizeOf(valueFormat);
        const buf = control.createBuffer(1 + valueSize);
        buf.setNumber(NumberFormat.UInt8LE, 0, register);
        buf.setNumber(valueFormat, 1, value);
        pins.i2cWriteBuffer(address, buf);
    }
    function i2cReadRegister(address: number, register: number, valueFormat?: NumberFormat): number {
        if (valueFormat === undefined)
            valueFormat = NumberFormat.UInt8LE;
        pins.i2cWriteNumber(address, register, NumberFormat.UInt8LE);
        return pins.i2cReadNumber(address, valueFormat);
    }
    /**
    * TODO: 显示数码管数值。
    */
    //% blockId=display_seg_number block="control seg %module display number %num"
    //% weight=65
    export function displaySegNumber(module: ModuleIndex, num: number) {
        let buf = pins.createBuffer(4);
        buf[0] = 0;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = 0;
        let str_num = num.toString();//数字转为字符串
        let len = str_num.length;//取长度
        let j = 0;
        if (validate(str_num)) {//判断是否需要处理
            for (let i = len - 1; i >= 0; i--) {//从后往前判断
                if (str_num.charAt(i) == '.') {//如果有小数点。
                    buf[3 - j] = (str_num.charCodeAt(i - 1) - '0'.charCodeAt(0)) | 0x80;//最高位置1
                    i--;
                } else if (str_num.charAt(i) == "-") {
                    buf[3 - j] = 0x40;  //这一位为64
                } else {
                    buf[3 - j] = str_num.charCodeAt(i) - '0'.charCodeAt(0);
                }
                j++;
            }
            pins.i2cWriteBuffer(SEG_ADDRESS + module, buf);
        }
    }
    /**
    * TODO: 读取电位器值。
    */
    //% blockId=read_pm block="read %module pm data"
    //% weight=65
    export function readPmData(module: ModuleIndex): number {
        i2cWriteRegister(PM_ADDRESS + module, 0x00, 0x01);
        let dataL;
        let dataH;
        let data;
        dataL = i2cReadRegister(PM_ADDRESS + module, 0x01, NumberFormat.UInt8LE);
        dataH = i2cReadRegister(PM_ADDRESS + module, 0x02, NumberFormat.UInt8LE);
        data = dataL + dataH * 256;
        return (data)
    }
}
