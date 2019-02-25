import * as express from 'express';
import * as path from 'path';
import * as httpServer from 'http';
import * as socketio from 'socket.io';
import GameController from './Game/GameController';

const app: express.Application = express();
app.set('port', process.env.PORT || 3000);

const http : httpServer.Server = new httpServer.Server(app);
const io : SocketIO.Server = socketio(http);

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve('./client/index.html'));
});

const game = new GameController();

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function(socket: SocketIO.Socket) {
  console.log('a user connected');
  // whenever we receive a 'message' we log it out
  socket.on('message', function(message: any){
    console.log(message);
  });
});


http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});