import { Circle, Point, Dist } from "../Utils/Geometry";
import ServerConstants from "../Utils/ServerConstants";
import SkillController from "./Skills/SkillController";
import ExtendedSocket from "../Types/ExtendedSocket";
import { GetColorById } from "../Utils/GenerateColor";

class Player {
    public id: number;
    public nickname: string,
    public color: string;
    public velocity: number;
    public person: Circle;
    public destinyPosition: Point;
    public skillController: SkillController;
    public io: SocketIO.Server;
    public socket: ExtendedSocket;
    public kills: number;
    public deaths: number;

    constructor(_id: number, _io: SocketIO.Server, _socket: ExtendedSocket) {
        this.id = _id;
        this.color = GetColorById(_id);
        this.destinyPosition = new Point(
            (ServerConstants.World.Width - ServerConstants.Player.Raio) * Math.random(),
            (ServerConstants.World.Height - ServerConstants.Player.Raio) * Math.random()
        );

        this.velocity = ServerConstants.Player.Velocity;
        this.person = new Circle(this.destinyPosition.Clone(), ServerConstants.Player.Raio);
        this.skillController = new SkillController(this);

        this.kills = 0;
        this.deaths = 0;

        this.io = _io;
        this.socket = _socket;

        this.nickname = this.socket.handshake.query.nickname;
    }

    AddKill(): void {
        this.kills++;
    }

    AddDeath(): void {
        this.deaths++;
    }

    SetDestinationPosition(p: Point): void {
        this.destinyPosition = p.CutBorderWord();
    }

    SetPlayerPos(p: Point): void {
        this.person.center = p.CutBorderWord(this.person.raio);
    }

    UpdateDestinationPosition(data: any): ResponseToClient {
        this.SetDestinationPosition(new Point(data.mousePos.x, data.mousePos.y));

        return {
            event: 'RIGHT_CLICK',
            status: 'OK'
        };
    }

    TickPlayerPos(): void {
        let move: Point;

        if (Dist(this.person.center, this.destinyPosition) > this.velocity) {
            move = this.destinyPosition
                .Sub(this.person.center)
                .Normalized()
                .Mult(this.velocity);
        }
        else {
            move = this.destinyPosition.Sub(this.person.center);
        }

        this.SetPlayerPos(this.person.center.Add(move));
    }

    ToClient(): Object {
        const response: any = {
            kills: this.kills,
            deaths: this.deaths,
            posX: this.person.center.x,
            posY: this.person.center.y,
            skills: this.skillController.ToClient()
        };

        return response;
    }
}


export default Player;