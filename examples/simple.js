/*
 * Read raw data from the TSL2591 sensor once per second and show on console output.
 */

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
