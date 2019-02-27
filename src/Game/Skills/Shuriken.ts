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
        this.shuriken = new Circle(new Point(-100, -100), ServerConstants.Skills.Shuriken.Raio);
    }

    public Reset(): void {
        this.shuriken.center = this.player.person.center;
        this.status = EnumStatusShuriken.OFF;
        this.direction.x = 0;
        this.direction.y = 0;
    }

    public SetShurikenPosition(p: Point): void {
        if (p.IsOutsideWord(this.shuriken.raio)) {
            this.direction.x = 0;
            this.direction.y = 0;
            this.status == EnumStatusShuriken.GOING;
        }
        this.shuriken.center = p.CutBorderWord(this.shuriken.raio);
    }

    public SetDirection(p: Point): void {
        this.direction = p.Normalized();
    }

    public HandlerShuriken(data: any): ResponseToClient {
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
            case EnumStatusShuriken.RETURNING:
                return {
                    event: 'SHURIKEN',
                    status: 'ANY',
                    message: 'Aguarde a shuriken chegar para arremessa-la novamente'
                };
            default:
        }
    }

    public UpdateShurikenPosition(): void {
        switch (this.status) {
            case EnumStatusShuriken.GOING:
                this.SetShurikenPosition(
                    this.shuriken.center.Add(this.direction.Mult(this.velocity))
                );
                break;
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

    private ShurikenColisionPlayer(players: Map<number, Player>): Player {
        let colisionPlayer: Player = null;
        let minorDistance: number = 1 << 30;

        players.forEach(p => {
            if (p.alive && p.id !== this.player.id && this.shuriken.intersects(p.person)) {
                const distance = Dist(this.shuriken.center, p.person.center);
                if (distance < minorDistance) {
                    colisionPlayer = p;
                    minorDistance = distance;
                }
            }
        });

        return colisionPlayer;
    }

    private ShurikenColisionShuriken(players: Map<number, Player>): Shuriken {
        let colisionShuriken: Shuriken = null;
        let minorDistance: number = 1 << 30;

        players.forEach(p => {
            if (p.skillController.shuriken.status !== EnumStatusShuriken.OFF
                && p.id !== this.player.id
                && this.shuriken.intersects(p.skillController.shuriken.shuriken)
            ) {
                const distance = Dist(this.shuriken.center, p.person.center);
                if (distance < minorDistance) {
                    colisionShuriken = p.skillController.shuriken;
                    minorDistance = distance;
                }
            }
        });

        return colisionShuriken;
    }

    public TickShuriken(players: Map<number, Player>): void {
        if (this.status === EnumStatusShuriken.OFF)
            return;

        const colisionPlayer: Player = this.ShurikenColisionPlayer(players);
        const colisionShuriken: Shuriken = this.ShurikenColisionShuriken(players);

        if (colisionPlayer !== null) {
            this.player.AddKill();
            colisionPlayer.AddDeath();

            this.player.io.emit('killPlayer', {
                killer: this.player.id,
                killed: colisionPlayer.id
            });

            this.status = EnumStatusShuriken.RETURNING;
        }

        if (colisionShuriken !== null) {
            this.SetDirection(
                this.shuriken.colision(this.direction, colisionShuriken.shuriken)
            );

            colisionShuriken.SetDirection(
                colisionShuriken.shuriken.colision(colisionShuriken.direction, this.shuriken)
            );

            this.status = EnumStatusShuriken.GOING;
        }

        if (this.status == EnumStatusShuriken.RETURNING
            && Dist(this.shuriken.center, this.player.person.center) < this.player.person.raio) {
            this.status = EnumStatusShuriken.OFF;
        }
    }

    public ToClient(): any {
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