import Player from "../Player";
import ServerConstants from "../../Utils/ServerConstants";
import AbstractSkill from "../../Types/AbstractSkill";
import GlobalVariables from "../../Utils/GlobalVariables";

class Shield implements AbstractSkill {
    private player: Player;
    private timeUsed: number;
    private countdown: number;
    private active: boolean;
    private duration: number;
    private protectedArea: number;

    constructor(_player: Player) {
        this.player = _player;
        this.timeUsed = -1000 * 60;
        this.countdown = ServerConstants.Skills.Shield.Countdown;
        this.duration = ServerConstants.Skills.Shield.Duration;
        this.protectedArea = ServerConstants.Skills.Shield.ProtectedArea;
        this.active = false;
    }

    public Reset() {
        this.timeUsed = -1000;
        this.active = false;
    }

    public ToClient(): any {
        const differenceTime = GlobalVariables.TimeNow - this.timeUsed;
        const response: any = {
            active: this.active,
            cd: Math.max(0, this.countdown - differenceTime),
        };

        if (this.active) {
            response.protectedArea = this.GetRealProtectedArea();
        }

        return response;
    }

    public HandlerEvent(data: any, players: Map<number, Player>): ResponseToClient {
        const differenceTime = GlobalVariables.TimeNow - this.timeUsed;

        if (differenceTime <= this.countdown) {
            return {
                event: 'SHIELD',
                status: 'CD',
                countdown: this.countdown - differenceTime
            };
        }

        this.active = true;
        this.timeUsed = GlobalVariables.TimeNow;

        return {
            event: 'SHIELD',
            status: 'OK',
            countdown: this.countdown
        };
    }

    public TickSkillPre(players: Map<number, Player>): void {
        if (GlobalVariables.TimeNow - this.timeUsed > this.duration) {
            this.active = false;
        }
    };

    public TickSkillPos(): void { };

    public IsActive(): boolean {
        return this.active;
    }

    public GetRealProtectedArea(): number {
        return this.protectedArea + this.player.person.raio;
    }
}

export default Shield;