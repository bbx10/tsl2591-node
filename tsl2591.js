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
var i2c = require('i2c');

// legend: _R = read only,  _RW = read/write
var TSL2591_ADDR	= 0x29;
var TSL2591_DEVICE_ID_VALUE = 0x50;
var TSL2591_DEVICE_RESET_VALUE = 0x80;
var TSL2591_COMMAND	= 0x80;
var TSL2591_NORMAL_OP	= 0x20;
var TSL2591_ENABLE_RW 	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x00;
var TSL2591_CONFIG_RW 	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x01;
var TSL2591_AILTL_RW  	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x04;
var TSL2591_AILTH_RW  	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x05;
var TSL2591_AIHTL_RW  	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x06;
var TSL2591_AIHTH_RW  	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x07;
var TSL2591_NPAILTL_RW	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x08;
var TSL2591_NPAILTH_RW	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x09;
var TSL2591_NPAIHTL_RW	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0A;
var TSL2591_NPAIHTH_RW	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0B;
var TSL2591_PERSIST_RW	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x0C;
var TSL2591_PID_R  	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x11;
var TSL2591_ID_R 	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x12;
var TSL2591_STATUS_R 	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x13;
var TSL2591_C0DATAL_R	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x14;
var TSL2591_C0DATAH_R	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x15;
var TSL2591_C1DATAL_R 	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x16;
var TSL2591_C1DATAH_R	= TSL2591_COMMAND | TSL2591_NORMAL_OP | 0x17;

var tsl2591 = function(options, tsloptions) {
    "use strict";
    this.i2caddr = TSL2591_ADDR;
    this.i2coptions = options;
    if (tsloptions === undefined) {
        this.tsloptions = {};
        this.tsloptions.AGAIN = 0;
        this.tsloptions.ATIME = 0;
    }
    else {
        this.tsloptions = tsloptions;
    }
    this.i2cdevice = new i2c(this.i2caddr, this.i2coptions);
};

tsl2591.prototype.init = function(tsloptions, callback) {
    "use strict";
    var i2cdev = this.i2cdevice;
    var that = this;

    if (tsloptions === undefined) {
        this.tsloptions = {};
        this.tsloptions.AGAIN = 0;
        this.tsloptions.ATIME = 0;
    }
    else {
        this.tsloptions = tsloptions;
    }
    // Reset the device and check for device ID to make sure it really is working
    // Next configure the device
    i2cdev.writeBytes(TSL2591_CONFIG_RW, [TSL2591_DEVICE_RESET_VALUE],
            function(err) {
                i2cdev.readBytes(TSL2591_ID_R, 1, function(err, data) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    else {
                        console.log(that.tsloptions);
                        if (data[0] === TSL2591_DEVICE_ID_VALUE) {
                            i2cdev.writeBytes(TSL2591_ENABLE_RW,
                                [0x03, (that.tsloptions.AGAIN<<4)|that.tsloptions.ATIME], function(err) {
                                    if (err) {
                                        callback(err);
                                    }
                                    else {
                                        callback(null);
                                    }
                                });
                        }
                    }
                });
            });
};

tsl2591.prototype.readLuminosity = function(callback) {
    "use strict";
    this.i2cdevice.readBytes(TSL2591_C0DATAL_R, 4, function(err, data) {
        if (err) {
            callback(err, null);
        }
        else {
            var light = {};
            //console.log(data);
            light.vis_ir = (data[1] << 8) | data[0];
            light.ir     = (data[3] << 8) | data[2];
            callback(null, light);
        }
    });
};

module.exports = tsl2591;
