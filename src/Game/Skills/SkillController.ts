import Blink from "./Blink";
import Player from "../Player";
import Shuriken from "./Shuriken";
import Shield from "./Shield";

class SkillController {
    private player: Player;
    public blink: Blink;
    public shuriken: Shuriken;
    public shield: Shield;

    constructor(_player: Player) {
        this.player = _player;
        this.blink = new Blink(_player);
        this.shuriken = new Shuriken(_player);
        this.shield = new Shield(_player);
    }

    public HandlerEventSkill(event: any, players: Map<number, Player>): ResponseToClient {
        switch (event.type) {
            case 'BLINK':
                return this.blink.HandlerEvent(event.data, players);
            case 'SHURIKEN':
                return this.shuriken.HandlerEvent(event.data, players);
            case 'SHIELD':
                return this.shield.HandlerEvent(event.data, players);
            default:
                return {
                    status: 'ERROR',
                    event: 'UNDEFINED'
                };
        }
    }

    public Reset(): void {
        this.shuriken.Reset();
        this.blink.Reset();
        this.shield.Reset();
    }

    public TickSkillControllerPre(players: Map<number, Player>): void {
        this.blink.TickSkillPre(players);
        this.shield.TickSkillPre(players);
        this.shuriken.TickSkillPre(players);
    }

    public TickSkillControllerPos(): void {
        this.blink.TickSkillPos();
        this.shield.TickSkillPos();
        this.shuriken.TickSkillPos();
    }

    public ToClient(): Object {
        return {
            shuriken: this.shuriken.ToClient(),
            blink: this.blink.ToClient(),
            shield: this.shield.ToClient()
        };
    }
}

export default SkillController;