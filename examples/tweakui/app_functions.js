"use strict";
const socket = io();

$(document).ready(function() {
    socket.on('light message', function(msg) {
        if (msg.visibleAndInfrared) {
            $('#lightdata').text("Visible+Infrared: " + msg.visibleAndInfrared + " Infrared: " + msg.infrared);
        }
        else {
            $('#lightdata').text(msg);
        }
    });
});

function sendDuration(duration) {
    console.log("sendDuration " + duration);
    socket.emit("als duration", duration);
}

function sendGain(gain) {
    console.log("sendGain " + gain);
    socket.emit("als gain", gain);
}
