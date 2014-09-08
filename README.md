tsl2591-node
============

Module to use the TSL2591 ambient light sensor (ALS).

## TSL2591

The TSL2591 from ams is an ambient light sensor with an I2C interface. It
reports infrared and full-spectrum (visible plus infrared) light intensity.

## Raspberry Pi

This module has been tested with a [Adafruit TSL2591](http://adafru.it/1980)
breakout board and a Raspberry Pi.

### Enable i2c

Be sure to enable support for i2c and install the i2c tools. Adafruit has a 
[tutorial](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c)
covering this. I suggest adding one more step at the end so i2c can be used
without sudo. This step adds the user pi to the i2c group. Logout and log
back in to make this take effect.
```
sudo usermod -a -G i2c pi
```

### node.js

The node.js package in the repo is too old be used with this module. Adafruit
has another excellent page showing
[how to install the latest node.js version](https://learn.adafruit.com/raspberry-pi-hosting-node-red/setting-up-node-dot-js)
on the Pi.

## Install

```
npm install tsl2591
```

## Getting started

The following code sends the raw sensor data to the console once per second
with minimal error handling.

```
var tsl2591 = require('tsl2591');

/* Use /dev/i2c-0 on older Raspis */
/* Note the options are passed directly to the i2c module */
var light = new tsl2591({device: '/dev/i2c-1'});
```

The options object configures the sensor gain and ADC integration duration.

### ALS Gain

AGAIN: 0 = 1X (Low), 1 = 25X (Medium), 2 = 428X (High), 3 = 9876 (Max)

### ALS Duration

ATIME: 0 = 100 ms, 1 = 200 ms, 2 = 300 ms, 3 = 400 ms, 4 = 500 ms, 5 = 600 ms

```
light.init({AGAIN: 0, ATIME: 1}, function(err) {
    if (err) {
        console.log(err);
        process.exit(-1);
    }
    else {
        console.log('TSL2591 ready');
        setInterval(function() {
            light.readLuminosity(function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
            });
        }, 1000);
    }
});
```

## Output

The data returned by readLuminosity is an object with raw sensor values.

* ```vis_ir``` is the sensor value from the visible and infrared light sensor.
* ```ir```` is the sensor value from the infrared sensor.

## Examples directory

tweakui creates a web interface (express+socket.io) to the sensor. The page
shows the output of the sensor in real-time. The gain and duration options can
be changed via drop down boxes.
