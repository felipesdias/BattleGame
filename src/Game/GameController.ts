import ServerConstants from "../Utils/ServerConstants";
import Player from "./Player";

class GameController {
    private openSlots: number[];
    public players: Map<number, Player>;

    constructor() {
        this.openSlots = Array<number>();
        for (let i = 0; i < ServerConstants.GameController.NumberOfPlayers; i++) {
            this.openSlots.push(i);
        }

        this.players = new Map<number, Player>();
    }

    public AddPlayer(): Player {
        if (this.openSlots.length == 0)
            return null;

        const newPlayer = new Player(this.openSlots.shift());
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
                raio: player.person.raio,
                posX: player.person.center.x,
                posY: player.person.center.y
            }
        });

        return initialPack;
    }

    public GetUpdatePack(): Object {
        const updatePack = Object.create(null);
        updatePack.players = {};
        updatePack.animations = [];

        this.players.forEach(player => {
            player.TickPlayerPos();
        });

        this.players.forEach(player => {
            player.skillController.TickSkillController(this.players);
        });

        this.players.forEach((player, id) => {
            updatePack.players[id] = player.ToClient();
        });

        return updatePack;
    }
}

export default GameController;