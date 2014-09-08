var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var tsl2591 = require('tsl2591');

var light = new tsl2591({device: '/dev/i2c-1'});

// ALS = Ambient Light Sensor
var als_gain = 0;
var als_duration = 0;

function als_start(als_options) {
    "use strict";
    light.init(als_options, function(err) {
        if (err) {
            console.log(err);
            process.exit(-2);
        }
        else {
            console.log('TSL2591 ready');
        }
    });
}

function getLum() {
    "use strict";
    light.readLuminosity(function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            io.emit('light message', data);
        }
    });
    setTimeout(getLum, 250);
}

app.use(express.static("."));

app.get('/', function(req, res){
    "use strict";
    res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket) {
    "use strict";
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });
    socket.on('als duration', function(duration) {
        console.log('duration: ' + duration);
        als_duration = duration;
        als_start({AGAIN: als_gain, ATIME: als_duration});
    });
    socket.on('als gain', function(gain) {
        console.log('gain: ' + gain);
        als_gain = gain;
        als_start({AGAIN: als_gain, ATIME: als_duration});
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

als_start({AGAIN: als_gain, ATIME: als_duration});
getLum();
