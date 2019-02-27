import Blink from "./Blink";
import Player from "../Player";
import Shuriken from "./Shuriken";

class SkillController {
    private player: Player;
    public blink: Blink;
    public shuriken: Shuriken;

    constructor(_player: Player) {
        this.player = _player;
        this.blink = new Blink(_player);
        this.shuriken = new Shuriken(_player);
    }

    TickSkillController(players: Map<number, Player>): void {
        this.shuriken.TickShuriken(players);
    }

    ToClient(): Object {
        const response: any = {
            shuriken: this.shuriken.ToClient()
        };

        return response;
    }
}

export default SkillController;