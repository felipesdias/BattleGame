import Constants from "../Utils/ServerConstants";
import Player from "./Player";

class GameController {
    private openSlots: number[];
    private players: Map<number, Player>;

    constructor() {
        this.openSlots = Array<number>();
        for (let i = 0; i < Constants.GameController.NumberOfPlayers; i++) {
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
        return this.players.delete(player.id);
    }

    public GetInitialPack(): Object {
        const initialPack = Object.create(null);

        this.players.forEach((player, id) => {
            initialPack[id] = {
                id: player.id,
                posX: player.person.center.x,
                posY: player.person.center.y
            }
        });

        return initialPack;
    }

    public GetUpdatePack(): Object {
        const updatePack = Object.create(null);

        this.players.forEach((player, id) => {
            updatePack[id] = {
                posX: player.person.center.x,
                posY: player.person.center.y
            }
        });

        return updatePack;
    }
}

export default GameController;