import Player from "../Player";
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
        this.velocity = ServerConstants.Skills.Shuriken.Velocity;
        this.shuriken = new Circle(new Point(), ServerConstants.Skills.Shuriken.Raio);
    }

    SetShurikenPosition(p: Point): void {
        this.shuriken.center = p.CutBorderWord(this.shuriken.raio);
    }

    SetDirection(p: Point): void {
        this.direction = p.Normalized();
    }

    HandlerShuriken(data: any): ResponseToClient {
        switch (this.status) {
            case EnumStatusShuriken.OFF:
                this.status = EnumStatusShuriken.GOING;
                this.SetShurikenPosition(this.player.person.center);
                this.SetDirection((new Point(data.mousePos.x, data.mousePos.y)).Sub(this.player.person.center));
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
            case EnumStatusShuriken.KILLED:
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
        switch (this.status) {
            case EnumStatusShuriken.GOING:
                this.SetShurikenPosition(
                    this.shuriken.center.Add(this.direction.Mult(this.velocity))
                );
                break;
            case EnumStatusShuriken.KILLED:
            case EnumStatusShuriken.RETURNING:
                this.SetShurikenPosition(
                    this.shuriken.center.Add(
                        this.player.person.center.Sub(this.shuriken.center).Normalized().Mult(this.velocity * 1.5)
                    )
                );
                break;
            default:
        }
    }

    TickShuriken(players: Map<number, Player>): void {
        if (this.status === EnumStatusShuriken.OFF)
            return;

        let colisionPlayer: Player = null;
        let minorDistance: number = 1 << 30;

        if (this.status !== EnumStatusShuriken.KILLED) {
            players.forEach(p => {
                if (p.id !== this.player.id && this.shuriken.intersects(p.person)) {
                    const distance = Dist(this.shuriken.center, p.person.center);
                    if (distance < minorDistance) {
                        colisionPlayer = p;
                        minorDistance = distance;
                    }
                }
            });
        }

        if (colisionPlayer !== null) {
            // this.player.AddKill();
            // colisionPlayer.AddDeath();

            // this.player.io.emit('killPlayer', {
            //     killer: this.player.id,
            //     killed: colisionPlayer.id
            // });

            // this.status = EnumStatusShuriken.KILLED;

            this.status = EnumStatusShuriken.GOING;
            this.SetDirection(
                this.shuriken.center.Sub(colisionPlayer.person.center).Sub(this.direction)
            );
        }

        if ((this.status === EnumStatusShuriken.RETURNING || this.status == EnumStatusShuriken.KILLED)
            && Dist(this.shuriken.center, this.player.person.center) < this.player.person.raio) {
            this.status = EnumStatusShuriken.OFF;
        }

        this.UpdateShurikenPosition();
    }

    ToClient(): any {
        if (this.status === EnumStatusShuriken.OFF)
            return null;

        const response: any = {
            posX: this.shuriken.center.x,
            posY: this.shuriken.center.y,
            raio: this.shuriken.raio,
        };

        return response;
    }
}

export default Shuriken;