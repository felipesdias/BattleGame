import * as express from 'express';
import * as path from 'path';
import * as httpServer from 'http';
import * as socketio from 'socket.io';
import GameController from './Game/GameController';
import ExtendedSocket from './Types/ExtendedSocket';
import GlobalVariables from './Utils/GlobalVariables';
import { GetTimeStamp } from './Utils/Utils';

const app: express.Application = express();
const port = process.env.PORT || 8080;
app.set('port', port);

const http: httpServer.Server = new httpServer.Server(app);
const io: SocketIO.Server = socketio(http);

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('./client/index.html'));
});

app.use('/client', express.static('client'));

const game: GameController = new GameController(io);

io.on('connection', function (socket: ExtendedSocket) {
    const newPlayer = game.AddPlayer(socket);

    if (newPlayer !== null) {
        console.log(`Player ${newPlayer.id} connected`);
        socket.player = newPlayer;

        const initialPack: any = game.GetInitialPack();

        socket.broadcast.emit('addPlayer', initialPack[socket.player.id]);
        socket.emit('initialPack', initialPack);

        socket.on('updateEvent', function (event) {
            let response: ResponseToClient;

            if (event.type === 'rightclick') {
                response = socket.player.UpdateDestinationPosition(event.data);
            } else if (socket.player.alive) {
                response = socket.player.skillController.HandlerEventSkill(event, game.players);
            }
            socket.emit('responseEvent', response);
        });
    }
    else {
        socket.disconnect();
    }

    socket.on('disconnect', function () {
        if (socket.player !== null) {
            console.log(`Player ${newPlayer.id} disconnected`);
            io.emit('deletePlayer', socket.player.id);
            game.RemovePlayer(socket.player);
        }
    });
});


http.listen(port, function () {
    console.log(`listening on *:+${port}`);
});

setInterval(function () {
    GlobalVariables.TimeNow = GetTimeStamp();
    io.emit('updatePack', game.GetUpdatePack());
}, 20);