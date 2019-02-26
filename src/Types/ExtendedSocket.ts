import Player from "../Game/Player";

interface ExtendedSocket extends SocketIO.Socket {
    player: Player;
}

export default ExtendedSocket;