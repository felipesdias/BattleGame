import * as express from 'express';
import * as path from 'path';
import * as httpServer from 'http';
import * as socketio from 'socket.io';
import GameController from './Game/GameController';
import ExtendedSocket from './Types/ExtendedSocket';

const app: express.Application = express();
app.set('port', process.env.PORT || 3000);

const http: httpServer.Server = new httpServer.Server(app);
const io: SocketIO.Server = socketio(http);

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('./client/index.html'));
});

const game = new GameController();

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function (socket: ExtendedSocket) {
    const newPlayer = game.AddPlayer();

    if (newPlayer !== null) {
        console.log(`Player ${newPlayer.id} connected`);
        socket.player = newPlayer;

        socket.emit('initialPack', game.GetInitialPack());
        // whenever we receive a 'message' we log it out
        socket.on('message', function (message: any) {
            console.log(message);
        });
    } else {
        socket.disconnect();
    }

    socket.on('disconnect', function () {
        if (socket.player !== null) {
            console.log(`Player ${newPlayer.id} disconnected`);
            game.RemovePlayer(socket.player);
        }
    });
});


http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});

setInterval(function () {
    io.emit('updatePack', game.GetUpdatePack());
}, 25);