import Player from "../Player";
import { GetTimeStamp } from "../../Utils/Utils";
import ServerConstants from "../../Utils/ServerConstants";
import { Dist, Point } from "../../Utils/Geometry";

class Blink {
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

    DoBlink(x: number, y: number, players: Map<number, Player>): ResponseToClient {
        const timeNow: number = GetTimeStamp();
        const differenceTime = timeNow - this.timeUsed;

        if (differenceTime <= this.countdown) {
            return {
                event: 'BLINK',
                status: 'CD',
                countdown: this.countdown - differenceTime
            };
        }

        const pointToBlink: Point = new Point(x, y);

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
}

export default Blink;