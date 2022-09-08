"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Tsl2591 = require('tsl2591');

// ALS = Ambient Light Sensor
let alsGain = 0;
let alsDuration = 0;

async function startAls(alsOptions) {
    try {
        await tsl2591.init({
            busNumber: 1,
            tslOptions: alsOptions
        });
        console.log('TSL2591 ready');
    } catch (err) {
        console.log(err);
        process.exit(-1);
    }
}

async function getLum() {
    try {
        const data = await tsl2591.readLuminosity();
        io.emit('light message', data);
    } catch (err) {
        console.log(err);
    }
    setTimeout(getLum, 250);
}

async function main() {
    app.use(express.static("."));

    app.get('/', function(req, res) {
        res.sendFile('index.html', { root: __dirname });
    });

    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
            console.log('a user disconnected');
        });
        socket.on('als duration', async function(duration) {
            console.log('duration: ' + duration);
            alsDuration = duration;
            await startAls({ AGAIN: alsGain, ATIME: alsDuration });
        });
        socket.on('als gain', async function(gain) {
            console.log('gain: ' + gain);
            alsGain = gain;
            await startAls({ AGAIN: alsGain, ATIME: alsDuration });
        });
    });

    http.listen(3000, function() {
        console.log('listening on *:3000');
    });

    await startAls({ AGAIN: alsGain, ATIME: alsDuration });
    await getLum();
}

const tsl2591 = new Tsl2591();
main().then();
