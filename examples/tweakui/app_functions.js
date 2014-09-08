var socket = io();

$(document).ready(function() {
    "use strict";
    socket.on('light message', function(msg) {
        if (msg.vis_ir) {
            $('#lightdata').text("Visible+Infrared: " + msg.vis_ir + " Infrared: " + msg.ir);
        }
        else {
            $('#lightdata').text(msg);
        }
    });
});

function sendDuration(duration) {
    "use strict";
    console.log("sendDuration " + duration);
    socket.emit("als duration", duration);
}

function sendGain(gain) {
    "use strict";
    console.log("sendGain " + gain);
    socket.emit("als gain", gain);
}
