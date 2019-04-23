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
    res.sendFile(path.resolve('../client/index.html'));
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

        socket.on('updateMousePosition', function (mousePosition) {
            socket.player.UpdateMousePos(mousePosition.x, mousePosition.y);
        });

        socket.on('updateEvent', function (event) {
            let response: Object;
            switch(event.type) {
                case 'click': 
                    response = socket.player.skillController.blink.DoBlink(game.players)
                    break;
                default: 
                    return;
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
}, 25);
