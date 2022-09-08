"use strict";
/*
The MIT License (MIT)

Copyright (c) 2014 bbx10node@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Demonstrate reading ambient light readings from the ams TSL2591 light 
// sensor using
//
// Tested using an Adafruit breakout board and a Raspberry Pi
// http://adafru.it/1980
//
//
const i2c = require('i2c-bus');

// legend: _R = read only,  _RW = read/write
const TSL2591_ADDR    = 0x29;
const TSL2591_DEVICE_ID_VALUE = 0x50;
const TSL2591_DEVICE_RESET_VALUE = 0x80;
const TSL2591_ENABLE_POWER_OFF = 0x00;
const TSL2591_ENABLE_POWER_ON = 0x01;
const TSL2591_ENABLE_AEN_VALUE = 0x02;
const TSL2591_COMMAND       = 0x80;
const TSL2591_NORMAL_OP     = 0x20;
const TSL2591_ENABLE_RW     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x00;
const TSL2591_CONFIG_RW     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x01;
const TSL2591_AILTL_RW      = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x04;
const TSL2591_AILTH_RW      = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x05;
const TSL2591_AIHTL_RW      = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x06;
const TSL2591_AIHTH_RW      = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x07;
const TSL2591_NPAILTL_RW    = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x08;
const TSL2591_NPAILTH_RW    = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x09;
const TSL2591_NPAIHTL_RW    = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0A;
const TSL2591_NPAIHTH_RW    = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0B;
const TSL2591_PERSIST_RW    = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0C;
const TSL2591_PID_R         = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x11;
const TSL2591_ID_R          = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x12;
const TSL2591_STATUS_R      = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x13;
const TSL2591_C0DATAL_R     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x14;
const TSL2591_C0DATAH_R     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x15;
const TSL2591_C1DATAL_R     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x16;
const TSL2591_C1DATAH_R     = TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x17;

class Tsl2591 {
    async init({ busNumber, options, tslOptions }) {
        this.i2cDevice = await i2c.openPromisified(busNumber, options);
        await this.reset();
        if (await this.isWorking()) {
            await this.configure(this.ensureTslOptions(tslOptions));
        }
    }

    ensureTslOptions(tslOptions) {
        if (tslOptions === undefined) {
            return { AGAIN: 0, ATIME: 0 };
        }

        return tslOptions;
    }

    async reset() {
        try {
            await this.i2cDevice.writeByte(TSL2591_ADDR, TSL2591_CONFIG_RW, TSL2591_DEVICE_RESET_VALUE);
        } catch (err) {
            // Intentionally empty
        }
    }

    async isWorking() {
        // Check for device ID to make sure it really is working
        const deviceId = await this.i2cDevice.readByte(TSL2591_ADDR, TSL2591_ID_R);
        
        return deviceId === TSL2591_DEVICE_ID_VALUE;
    }

    async configure(tslOptions) {
        await this.i2cDevice.writeByte(TSL2591_ADDR, TSL2591_CONFIG_RW, (tslOptions.AGAIN << 4) | tslOptions.ATIME);
        await this.enable();
    }

    async enable() {
        await this.i2cDevice.writeByte(TSL2591_ADDR, TSL2591_ENABLE_RW, TSL2591_ENABLE_AEN_VALUE | TSL2591_ENABLE_POWER_ON);
    }

    async readLuminosity() {
        const visibleAndInfrared = await this.i2cDevice.readWord(TSL2591_ADDR, TSL2591_C0DATAL_R);
        const infrared = await this.i2cDevice.readWord(TSL2591_ADDR, TSL2591_C1DATAL_R);

        return { visibleAndInfrared, infrared };
    }
}

module.exports = Tsl2591;
