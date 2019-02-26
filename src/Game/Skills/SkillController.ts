import Blink from "./Blink";
import Player from "../Player";

class SkillController {
    private player: Player;
    public blink: Blink;

    constructor(_player: Player) {
        this.player = _player;
        this.blink = new Blink(_player);
    }
}

export default SkillController;