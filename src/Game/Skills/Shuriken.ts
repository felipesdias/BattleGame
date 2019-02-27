import Player from "../Player";
import { GetTimeStamp, CutWidthPlayer, CutHeightPlayer } from "../../Utils/Utils";
import ServerConstants from "../../Utils/ServerConstants";
import { Dist, Point, Circle } from "../../Utils/Geometry";
import EnumStatusShuriken from "./EnumStatusShuriken";

class Shuriken {
    private player: Player;
    private status: EnumStatusShuriken;
    private shuriken: Circle;
    private direction: Point;
    private velocity: number;

    constructor(_player: Player) {
        this.player = _player;
        this.status = EnumStatusShuriken.OFF;
        this.direction = new Point();
        this.velocity = _player.velocity;
        this.shuriken = new Circle(new Point(), ServerConstants.Skills.Shuriken.Raio);
    }

    SetShurikenPosition(p: Point): void {
        this.shuriken.center.x = CutWidthPlayer(p.x);
        this.shuriken.center.y = CutHeightPlayer(p.y);
    }

    SetDirection(p: Point): void {
        this.direction = p.Normalized();
    }

    HandlerShuriken(x: number, y: number): ResponseToClient {
        switch (this.status) {
            case EnumStatusShuriken.OFF:
                this.status = EnumStatusShuriken.GOING;
                this.SetShurikenPosition(this.player.person.center);
                this.SetDirection((new Point(x, y)).Sub(this.player.person.center));
                return {
                    event: 'OK',
                    status: 'ANY',
                    message: 'Shuriken arremessada'
                };
            case EnumStatusShuriken.GOING:
                this.status = EnumStatusShuriken.RETURNING;
                return {
                    event: 'OK',
                    status: 'ANY',
                    message: 'Shuriken esta voltando para você'
                };
            case EnumStatusShuriken.RETURNING:
                return {
                    event: 'SHURIKEN',
                    status: 'ANY',
                    message: 'Aguarde a shuriken chegar para arremessa-la novamente'
                };
            default:
        }
    }

    UpdateShurikenPosition(): void {
        if (this.status === EnumStatusShuriken.GOING) {
            this.SetShurikenPosition(
                this.shuriken.center.Add(this.direction.Mult(this.velocity))
            );
        }
        else if (this.status === EnumStatusShuriken.RETURNING) {
            this.SetShurikenPosition(
                this.shuriken.center.Add(
                    this.player.person.center.Sub(this.shuriken.center).Normalized().Mult(this.velocity * 1.5)
                )
            );
        }
    }

    TickShuriken(players: Map<number, Player>): void {
        if (this.status === EnumStatusShuriken.OFF)
            return;

        let colisionPlayer: Player = null;
        let minorDistance: number = 1 << 30;
        players.forEach(p => {
            if (p.id !== this.player.id && this.shuriken.intersects(p.person)) {
                const distance = Dist(this.shuriken.center, p.person.center);
                if (distance < minorDistance) {
                    colisionPlayer = p;
                    minorDistance = distance;
                }
            }
        });

        if (colisionPlayer !== null) {
            console.log(`Player ${this.player.id} matou ${colisionPlayer.id}`);
            this.status = EnumStatusShuriken.RETURNING;
        }

        if (this.status === EnumStatusShuriken.RETURNING
            && Dist(this.shuriken.center, this.player.person.center) < this.player.person.raio) {
            this.status = EnumStatusShuriken.OFF;
        }

        this.UpdateShurikenPosition();
    }

    ToClient(): any {
        if (this.status === EnumStatusShuriken.OFF)
            return null;

        return {
            posX: this.shuriken.center.x,
            posY: this.shuriken.center.y,
            raio: this.shuriken.raio
        };
    }
}

export default Shuriken;