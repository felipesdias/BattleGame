import Constants from "../Utils/Constants";

class GameController {
    private openSlots: number[];

    constructor() {
        this.openSlots = Array<number>();
        for(let i=0; i<Constants.GameController.NumberOfPlayers; i++) {
            this.openSlots.push(i);
        }
        
    }
}

export default GameController;