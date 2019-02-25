"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const httpServer = require("http");
const socketio = require("socket.io");
const app = express();
app.set('port', process.env.PORT || 3000);
const http = new httpServer.Server(app);
const io = socketio(http);
app.get('/', (req, res) => {
    res.sendFile(path.resolve('./client/index.html'));
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function (socket) {
    console.log('a user connected');
    // whenever we receive a 'message' we log it out
    socket.on('message', function (message) {
        console.log(message);
    });
});
http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});
//# sourceMappingURL=server.js.map