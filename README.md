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

The following code reads raw data from the TSL2591 sensor once per second and show on console output.

The ```tslOptions``` object configures the sensor gain and ADC integration duration.

### ALS Gain

AGAIN: 0 = 1X (Low), 1 = 25X (Medium), 2 = 428X (High), 3 = 9876 (Max)

### ALS Duration

ATIME: 0 = 100 ms, 1 = 200 ms, 2 = 300 ms, 3 = 400 ms, 4 = 500 ms, 5 = 600 ms

```
const Tsl2591 = require('tsl2591');

async function showLum() {
    try {
        const data = await tsl2591.readLuminosity();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
    setTimeout(showLum, 1000);
}

async function main() {
    try {
        /* Use 0 as busNumber in init function (/dev/i2c-0) on older Raspis */
        /* Note that the busNumber and the options object are passed directly to the i2c-bus module */
        await tsl2591.init({
            busNumber: 1,
            tslOptions: { AGAIN: 0, ATIME: 1 }
        });
        console.log('TSL2591 ready');
    } catch (err) {
        console.log(err);
        process.exit(-1);
    }
    
    await showLum();
}

const tsl2591 = new Tsl2591();
main().then();
```

## Output

The data returned by readLuminosity is an object with raw sensor values.

* ```visibleAndInfrared``` is the sensor value from the visible and infrared light sensor.
* ```infrared``` is the sensor value from the infrared sensor.

## Examples directory

tweakui creates a web interface (express+socket.io) to the sensor. The page
shows the output of the sensor in real-time. The gain and duration options can
be changed via drop down boxes.
