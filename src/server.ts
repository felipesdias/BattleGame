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

            if(event.type === 'rightclick') {
                response = socket.player.UpdateDestinationPosition(event.data);
            } else if(socket.player.alive) {
                switch (event.type) {
                    case 'blink':
                        response = socket.player.skillController.blink.DoBlink(event.data, game.players)
                        break;
                    case 'shuriken':
                        response = socket.player.skillController.shuriken.HandlerShuriken(event.data);
                        default:
                    return;
                }
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


http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});

setInterval(function () {
    io.emit('updatePack', game.GetUpdatePack());
}, 20);