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
}

export default GameController;