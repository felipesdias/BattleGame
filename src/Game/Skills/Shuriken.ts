import Player from "../Player";
import ServerConstants from "../../Utils/ServerConstants";
import { Dist, Point, Circle } from "../../Utils/Geometry";
import EnumStatusShuriken from "./EnumStatusShuriken";
import AbstractSkill from "../../Types/AbstractSkill";

class Shuriken implements AbstractSkill {
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

    public ToClient(): any {
        if (this.status === EnumStatusShuriken.OFF)
            return {
                status: this.status
            };

        const response: any = {
            posX: this.shuriken.center.x,
            posY: this.shuriken.center.y,
            raio: this.shuriken.raio,
            status: this.status
        };

        return response;
    }

    public HandlerEvent(data: any, players: Map<number, Player>): ResponseToClient {
        switch (this.status) {
            case EnumStatusShuriken.OFF:
                this.status = EnumStatusShuriken.GOING;
                this.SetShurikenPosition(this.player.person.center);
                this.SetDirection((new Point(data.mousePos.x, data.mousePos.y)).Sub(this.player.person.center));
                return {
                    event: 'SHURIKEN',
                    status: 'OK',
                    message: 'Shuriken arremessada'
                };
            case EnumStatusShuriken.GOING:
                this.status = EnumStatusShuriken.RETURNING;
                return {
                    event: 'SHURIKEN',
                    status: 'OK',
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

    public TickSkillPre(players: Map<number, Player>): void {
        if (this.status === EnumStatusShuriken.OFF)
            return;

        const colisionPlayer: Player = this.ShurikenColisionPlayer(players);
        const colisionShuriken: Shuriken = this.ShurikenColisionShuriken(players);

        if (colisionPlayer !== null) {
            if (colisionPlayer.skillController.shield.IsActive()) {
                this.SetDirection(
                    this.shuriken.Colision(this.direction, colisionPlayer.person)
                );

                this.status = EnumStatusShuriken.GOING;
            } else {
                this.player.AddKill();
                colisionPlayer.AddDeath();

                this.player.io.emit('killPlayer', {
                    killer: this.player.id,
                    killed: colisionPlayer.id
                });

                this.status = EnumStatusShuriken.RETURNING;
            }
        }

        if (colisionShuriken !== null) {
            this.SetDirection(
                this.shuriken.Colision(this.direction, colisionShuriken.shuriken)
            );

            colisionShuriken.SetDirection(
                colisionShuriken.shuriken.Colision(colisionShuriken.direction, this.shuriken)
            );

            this.status = EnumStatusShuriken.GOING;
        }

        if (this.status == EnumStatusShuriken.RETURNING
            && Dist(this.shuriken.center, this.player.person.center) < this.player.person.raio) {
            this.status = EnumStatusShuriken.OFF;
        }
    }

    public TickSkillPos(): void {
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

    private ShurikenColisionPlayer(players: Map<number, Player>): Player {
        let colisionPlayer: Player = null;
        let minorDistance: number = 1 << 30;

        players.forEach(p => {
            const circleToCheck = p.skillController.shield.IsActive()
                ? new Circle(p.person.center, p.skillController.shield.GetRealProtectedArea())
                : p.person;

            if (p.alive && p.id !== this.player.id && this.shuriken.Intersects(circleToCheck)) {
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
                && this.shuriken.Intersects(p.skillController.shuriken.shuriken)
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
}

export default Shuriken;