import * as express from 'express';
import * as path from 'path';
import * as httpServer from 'http';
import * as socketio from 'socket.io';
import GameController from './Game/GameController';
import ExtendedSocket from './Types/ExtendedSocket';
import ServerConstants from './Utils/ServerConstants';

const app: express.Application = express();
app.set('port', process.env.PORT || 3000);

const http: httpServer.Server = new httpServer.Server(app);
const io: SocketIO.Server = socketio(http);

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('./client/index.html'));
});

app.use('/client', express.static(__dirname + '/client'));

const game: GameController = new GameController();

io.on('connection', function (socket: ExtendedSocket) {
    const newPlayer = game.AddPlayer();

    if (newPlayer !== null) {
        console.log(`Player ${newPlayer.id} connected`);
        socket.player = newPlayer;

        const initialPack: any = game.GetInitialPack();

        socket.broadcast.emit('addPlayer', initialPack[socket.player.id]);
        socket.emit('initialPack', initialPack);

        socket.on('updateEvent', function (event) {
            let response: ResponseToClient;
            switch (event.type) {
                case 'rightclick':
                    response = socket.player.UpdateDestinationPosition(event.data.mousePos.x, event.data.mousePos.y);
                    break;
                case 'blink':
                    response = socket.player.skillController.blink.DoBlink(event.data.mousePos.x, event.data.mousePos.y, game.players)
                    break;
                case 'shuriken':
                    response = socket.player.skillController.shuriken.HandlerShuriken(event.data.mousePos.x, event.data.mousePos.y);
                    console.log(response);
                default:
                    return;
            }

            if (response['status'] !== 'OK') {
                socket.emit('responseEvent', response);
            }

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


http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});

setInterval(function () {
    io.emit('updatePack', game.GetUpdatePack());
}, 25);