import Player from "../Player";
import ServerConstants from "../../Utils/ServerConstants";
import { Dist, Point } from "../../Utils/Geometry";
import AbstractSkill from "../../Types/AbstractSkill";
import GlobalVariables from "../../Utils/GlobalVariables";

class Blink implements AbstractSkill {
    private player: Player;
    private timeUsed: number;
    private countdown: number;
    private protectedZone: number;

    constructor(_player: Player) {
        this.player = _player;
        this.timeUsed = -1000 * 60;
        this.countdown = ServerConstants.Skills.Blink.Countdown;
        this.protectedZone = ServerConstants.Skills.Blink.ProtectZone;
    }

    public Reset() {
        this.timeUsed = -1000;
    }

    public ToClient(): any {
        const differenceTime = GlobalVariables.TimeNow - this.timeUsed;
        return {
            cd: Math.max(0, this.countdown - differenceTime)
        };
    }

    public HandlerEvent(data: any, players: Map<number, Player>): ResponseToClient {
        const timeNow: number = GlobalVariables.TimeNow;
        const differenceTime = timeNow - this.timeUsed;

        if (differenceTime <= this.countdown) {
            return {
                event: 'BLINK',
                status: 'CD',
                countdown: this.countdown - differenceTime
            };
        }

        const pointToBlink: Point = new Point(data.mousePos.x, data.mousePos.y);

        let colision: boolean = false;
        players.forEach(p => {
            colision = colision || Dist(pointToBlink, p.person.center) <= this.protectedZone;
        });

        if (colision) {
            return {
                event: 'BLINK',
                status: 'ANY',
                countdown: Math.max(0, this.countdown - differenceTime),
                message: 'Você não pode blinkar do lado de outro jogador'
            };
        }

        this.timeUsed = timeNow;
        this.player.SetPlayerPos(pointToBlink);
        this.player.SetDestinationPosition(pointToBlink);

        return {
            event: 'BLINK',
            status: 'OK',
            countdown: this.countdown
        };
    }

    public TickSkillPre(players: Map<number, Player>): void { };
    public TickSkillPos(): void { };
}

export default Blink;