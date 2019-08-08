import ServerConstants from "../Utils/ServerConstants";
import Player from "./Player";
import ExtendedSocket from "../Types/ExtendedSocket";

class GameController {
    private openSlots: number[];
    public io: SocketIO.Server;
    public players: Map<number, Player>;

    constructor(_io: SocketIO.Server) {
        this.openSlots = Array<number>();
        for (let i = 0; i < ServerConstants.GameController.NumberOfPlayers; i++) {
            this.openSlots.push(i);
        }

        this.players = new Map<number, Player>();
        this.io = _io;
    }

    public AddPlayer(_socket: ExtendedSocket): Player {
        if (this.openSlots.length == 0)
            return null;

        const newPlayer = new Player(this.openSlots.shift(), this.io, _socket);
        this.players.set(newPlayer.id, newPlayer);

        return newPlayer;
    }

    public RemovePlayer(player: Player): boolean {
        if (this.players.has(player.id)) {
            this.openSlots.push(player.id);
            return this.players.delete(player.id);
        }

        return false;
    }

    public GetInitialPack(): Object {
        const initialPack = Object.create(null);

        this.players.forEach((player, id) => {
            initialPack[id] = {
                id: player.id,
                nickname: player.nickname,
                color: player.color,
                raio: player.person.raio,
                posX: player.person.center.x,
                posY: player.person.center.y,
                kills: player.kills,
                deaths: player.deaths
            }
        });

        return initialPack;
    }

    public GetUpdatePack(): Object {
        const updatePack = Object.create(null);
        updatePack.players = {};
        updatePack.animations = [];

        this.players.forEach(player => {
            player.skillController.TickSkillControllerPre(this.players);
        });

        this.players.forEach(player => {
            player.skillController.TickSkillControllerPos();
        });

        this.players.forEach(player => {
            player.TickPlayerPos();
            updatePack.players[player.id] = player.ToClient();
        });

        return updatePack;
    }
}

export default GameController;