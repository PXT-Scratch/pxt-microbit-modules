/**
 * makecode I2C LCD1602 package for microbit.
 * From microbit/micropython Chinese community.
 * http://www.micropython.org.cn
 */

enum POINT {
    O = 0,
    X = 1,
} 
    
/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="T" block="天枢扩展模块"
namespace LANDZO_TS {
    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

    let max7219_row1: number = 0;
    let max7219_row2: number = 0;
    let max7219_row3: number = 0;
    let max7219_row4: number = 0;
    let max7219_row5: number = 0;
    let max7219_row6: number = 0;
    let max7219_row7: number = 0;
    let max7219_row8: number = 0;
    
	let proto_state: number = 0;
	let proto_length: number = 0;
	let proto_cmd: number = 0;
	let proto_index: number = 0;
	let proto_addr: number = 0;
	let proto_datas: Buffer = pins.createBuffer(64);

	// 数据
	let proto_aio1: number = 0;
	let proto_aio2: number = 0;
	let proto_gaio1: number = 0;
	let proto_gaio2: number = 0;
	
	let proto_dio1: number = 0;
	let proto_dio2: number = 0;
	let proto_dio3: number = 0;
	let proto_dio4: number = 0;
	let proto_dio5: number = 0;
	let proto_dio6: number = 0;
	let proto_gdio1: number = 0;
	let proto_gdio2: number = 0;
	let proto_chaoshengbo: number = 0;
	let proto_hongwaixunji1: number = 0;
	let proto_hongwaixunji2: number = 0;
	let proto_ds18b20: number = 0;
	let proto_dht11_temp: number = 0;
	let proto_dht11_humi: number = 0;
	
	
	
    // const BASE_BOARD_I2C_ADDR = 0x30
    // const JOY_BOARD_I2C_ADDR = 0x20
    
    export enum Keys {
        K1 = 0x01,
        K2 = 0x02,
        K3 = 0x03,
        K4 = 0x04,
        K5 = 0x05,
        K6 = 0x06,
        K7 = 0x07,
        K8 = 0x08,
    }
    
    export enum IO_ANALOG_R {
        P1 = 0xb0,
        P2 = 0xb1,
        GP1 = 0xb2,
        GP2 = 0xb3,
    }
    
    export enum IO_DIGITAL_R {
        P1 = 0xb0,
        P2 = 0xb1,
        P3 = 0xc1,
        P4 = 0xc2,
        P5 = 0xc3,
        P6 = 0xc4,
        GP1 = 0xb2,
        GP2 = 0xb3,
    }
    
    export enum IO_DIGITAL_W {
        P3 = 0x01,
        P4 = 0x02,
        P5 = 0x03,
        P6 = 0x04,
    }  
    
	export enum DZP_SMG_MODE {
		DZP_SMG_0 = 0x00,
		DZP_SMG_1 = 0x80,
		DZP_MODE = 0x00,
        SMG_MODE = 0x40,
		
		DZP_SMG_INIT = 0x20,
    }
	
	export enum LETTER {
		Num0 = 0,
        Num1 = 1,
        Num2 = 2,
        Num3 = 3,
        Num4 = 4,
        Num5 = 5,
        Num6 = 6,
        Num7 = 7,
        Num8 = 8,
		Num9 = 9,
		A = 10,
		B = 11,
		C = 12,
		D = 13,
		E = 14,
		F = 15,
		G = 16,
		H = 17,
		I = 18,
		J = 19,
		K = 20,
		L = 21,
		M = 22,
		N = 23,
		O = 24,
		P = 25,
		Q = 26,
		R = 27,
		S = 28,
		T = 29,
		U = 30,
		V = 31,
		W = 32,
		X = 33,
		Y = 34,
		Z = 35,
		Zhong = 36,
		Guo = 37,
    } 
	
    export enum STATE {
        RESET = 0,
        SET = 1,
    } 
    
	export enum Servos {
        S1 = 0x01,
        S2 = 0x02,
        S3 = 0x03,
        S4 = 0x04,
    }

    export enum Motors {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
    }
	
	export enum Proto {
        DIO = 0,
		AIO,
		DAIO,
		CHAOSHENGBO,
		RGB,
		HONGWAIXUNJI,
		SMG_DZP,
		DS18B20,
		DHT11,
		
		DUOJI,
		BUJINDIANJI,
		DIANJI,
		
		BOARD_STATE = 0xa1,
    }

	function write_proto(addr: number, cmd: number, len: number, dat0: number, dat1: number, dat2: number, dat3: number): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0xa1;
		buf[1] = addr;
		buf[2] = cmd;
		buf[3] = len;
        buf[4] = dat0;
        buf[5] = dat1;
        buf[6] = dat2;
		buf[7] = dat3;
        serial.writeBuffer(buf)
    }
	
	function write_2_motor(cmd: number, len: number, dat0: number, dat1: number, dat2: number, dat3: number): void {
		write_proto(0x02, cmd, len, dat0, dat1, dat2, dat3);
	}
	
	function write_2_sensor(cmd: number, len: number, dat0: number, dat1: number, dat2: number, dat3: number): void {
		write_proto(0x03, cmd, len, dat0, dat1, dat2, dat3);
	}
	
	function proto_deal(addr: number, cmd: number, datas: Buffer, len: number): void {
		switch (cmd) {
			case AIO: {
				proto_aio1 = datas[0];
				proto_aio2 = datas[1];
				proto_gaio1 = datas[2];
				proto_gaio2 = datas[3];
			}
			break;
			
			case DIO: {
				proto_dio1 = (datas[0] & 0x80) >> 7;
				proto_dio2 = (datas[0] & 0x40) >> 6;
				proto_dio3 = (datas[0] & 0x20) >> 5;
				proto_dio4 = (datas[0] & 0x10) >> 4;
				proto_dio5 = (datas[0] & 0x08) >> 3;
				proto_dio6 = (datas[0] & 0x04) >> 2;
				proto_gdio1 = (datas[0] & 0x02) >> 1;
				proto_gdio2 = (datas[0] & 0x01);
				
				proto_chaoshengbo = datas[1] + (datas[2] << 8);
				proto_hongwaixunji1 = (datas[3] & 0x80) >> 7;
				proto_hongwaixunji2 = (datas[3] & 0x40) >> 6;
			}
			break;
			
			// case DS18B20: {
				// proto_ds18b20 = datas[0];
			// }
			// break;
			
			// case DHT11: {
				// proto_dht11_temp = datas[0];
				// proto_dht11_humi = datas[1];
			// }
			// break;
		}
	}
	
	function proto_analyze(data: number): void {
		let temp: number = 0;
	
		switch(proto_state) {
			case 0: {
				if (data == UCP_HEAD) {
					proto_state = 1;
				} else {
					proto_state = 0;
				}
				proto_length = 0;
				proto_cmd = 0;
				proto_index = 0;
			}
			break;
			
			case 1: {
				proto_addr = data;
				proto_state = 2;
			}
			break;
			
			case 2: {
				proto_cmd = data;
				proto_state = 3;
			}
			break;
			
			case 3: {
				proto_length = data;
				if (proto_length == 0) {
					proto_deal(proto_addr, proto_cmd, 0, 0)
					proto_state = 0;
				} else {
					proto_state = 4;
				}
			}
			break;
			
			case 4: {
				proto_datas[proto_index++] = data;
				if (proto_index >= proto_length) {
					proto_deal(proto_addr, proto_cmd, proto_datas, proto_length);
					proto_state = 0;
				}
			}
			break;
				
		}
	}
	
	//% blockId="DUBLE_init" block="天枢扩展模块初始化" icon="\uf00a"
    //% weight=90 blockGap=8
    export function DUBLE_init(): void {
		serial.redirect(
			SerialPin.P12,
			SerialPin.P13,
			BaudRate.BaudRate115200
		)
	}
	
	//% blockId="DUBLE_run" block="天枢扩展模块运行" icon="\uf00a"
    //% weight=90 blockGap=8
    export function DUBLE_run(): void {
		let bufs = serial.readBuffer(0)
		if (bufs.length > 0) {
			for (let i = 0; i <= bufs.length - 1; i++) {
				proto_analyze(bufs[i])
			}
		}
	}
    
	//% blockId="MAX7219_show_letter" block="点阵屏|%where|显示字符 s %s" icon="\uf00a"
    //% weight=90 blockGap=8
    export function MAX7219_show_letter(where: number, what: LETTER): void {
		write_2_sensor(SMG_DZP, 3, DZP_MODE, where, what&0xff, 0);
	}
	
    //% blockId="RGB" block="RGB灯 |红%r|绿%g|蓝%b"
    //% weight=90 blockGap=8
    //% r.min=0 r.max=1
    //% g.min=0 g.max=1
    //% b.min=0 b.max=1
    export function RGB(r: number, g: number, b: number) :void {
        write_2_sensor(RGB, 3, r, g, b);
    }
    
    //% blockId="SMG_Off" block="关闭数码管"
    //% weight=90 blockGap=8
    export function SMG_Off() :void {
        write_2_sensor(SMG_DZP, 3, SMG_MODE, 0, 0, 0);
    }
    
    //% blockId="SMG" block="数码管显示 %r"
    //% weight=90 blockGap=8
    export function SMG(num: number) :void {
        write_2_sensor(SMG_DZP, 3, SMG_MODE, num&0xff, num>>8, 0);
    }
	
    //% blockId="GPIO_Read_Analog" block="|%io|端口模拟值"
    //% weight=50
    export function GPIO_Read_Analog(io: IO_ANALOG_R) :number {
        if (io == P1) {
			return proto_aio0;
		} else if (io == P2) {
			return proto_aio1;
		} else if (io == GP1) {
			return proto_gaio1;
		} else if (io == GP2) {
			return proto_gaio2;
		}
    }

    //% blockId="GPIO_Read_Digital" block="|%io|端口数字值"
    //% weight=50
    export function GPIO_Read_Digital(io: IO_DIGITAL_R) :number {
        switch (io) {
			case P1: return proto_dio1;
			case P2: return proto_dio2;
			case P3: return proto_dio3;
			case P4: return proto_dio4;
			case P5: return proto_dio5;
			case P6: return proto_dio6;
			case GP1: return proto_gdio1;
			case GP2: return proto_gdio2;
		}
    }    

    //% blockId="GPIO_Write_Digital" block="|%io|端口数字值写入|%d|"
    //% weight=50
    export function GPIO_Write_Digital(io: IO_DIGITAL_W, d: number) :void {
        write_2_sensor(DIO, 2, io, d);
    }
    
    
    //% blockId="DS18B20_read" block="温度传感器数值"
    //% weight=50
    export function DS18B20() :number {
        
    }
    
    //% blockId="DHT11_read_temperature" block="温湿度传感器温度数值"
    //% weight=50
    export function DHT11_temperature() :number {
        
    }
    
    //% blockId="DHT11_read_humidity" block="温湿度传感器湿度数值"
    //% weight=50
    export function DHT11_humidity() :number {
        
    }

    //% blockId="Ultrasonic_read" block="超声波距离值"
    //% weight=50
    export function Ultrasonic() :number {
        return proto_chaoshengbo;
    }
    
    //% blockId="BlackTraker_left" block="红外寻迹1"
    //% weight=50
    export function BlackTraker_left() :number {
       return proto_hongwaixunji1;
    }
    
    //% blockId="BlackTraker_right" block="红外寻迹2"
    //% weight=50
    export function BlackTraker_right() :number {
        return proto_hongwaixunji2;
    }
    

    //% blockId=landzobit_servo block="舵机|%index|角度 %degree"
    //% weight=100
    //% degree.min=0 degree.max=180
    export function Servo(index: Servos, degree: number): void {
        write_2_motor(DUOJI, 2, index, degree, 0, 0);
    }

    //% blockId=landzobit_motor_run block="电机|%index|速度 %speed"
    //% weight=85
    //% speed.min=-255 speed.max=255
    export function MotorRun(index: Motors, speed: number): void {
        write_2_motor(DIANJI, 2, index, speed, 0, 0);
    }


    //% blockId=landzobit_motor_dual block="电机|%motor1|速度 %speed1|%motor2|速度 %speed2"
    //% weight=84
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    export function MotorRunDual(motor1: Motors, speed1: number, motor2: Motors, speed2: number): void {
        MotorRun(motor1, speed1);
        MotorRun(motor2, speed2);
    }

    //% blockId=landzobit_motor_rundelay block="电机|%index|速度 %speed|延时 %delay|s"
    //% weight=81
    //% speed.min=-255 speed.max=255
    export function MotorRunDelay(index: Motors, speed: number, delay: number): void {
        MotorRun(index, speed);
        basic.pause(delay * 1000);
        MotorRun(index, 0);
    }

    //% blockId=landzobit_stop block="电机停止|%index|"
    //% weight=80
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }

    //% blockId=landzobit_stop_all block="停止所有电机"
    //% weight=79
    //% blockGap=50
    export function MotorStopAll(): void {
        for (let idx = 1; idx <= 4; idx++) {
            stopMotor(idx);
        }
    }
     
}
