/*
 * Read raw data from the TSL2591 once per second and show on console output.
 */

var tsl2591 = require('tsl2591');

/* Use /dev/i2c-0 on older Raspis */
var light = new tsl2591({device: '/dev/i2c-1'});

if (light === null) {
    console.log("TSL2591 not found");
    process.exit(-1);
}

light.init({AGAIN: 0, ATIME: 1}, function(err) {
    if (err) {
        console.log(err);
        process.exit(-2);
    }
    else {
        console.log('TSL2591 ready');
    }
});

showLum();

function showLum() {
    light.readLuminosity(function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data);
        }
    });
    setTimeout(showLum, 1000);
}
