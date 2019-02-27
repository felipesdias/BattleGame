import { Circle, Point, Dist } from "../Utils/Geometry";
import ServerConstants from "../Utils/ServerConstants";
import { CutHeightPlayer, CutHeightWord, CutWidthWord, CutWidthPlayer } from "../Utils/Utils";
import SkillController from "./Skills/SkillController";

class Player {
    public id: number;
    public velocity: number;
    public person: Circle;
    public destinyPosition: Point;
    public skillController: SkillController;

    constructor(_id: number) {
        this.id = _id;
        this.destinyPosition = new Point(
            (ServerConstants.World.Width - ServerConstants.Player.Raio) * Math.random(),
            (ServerConstants.World.Height - ServerConstants.Player.Raio) * Math.random()
        );

        this.velocity = ServerConstants.Player.Velocity;
        this.person = new Circle(this.destinyPosition.Clone(), ServerConstants.Player.Raio);
        this.skillController = new SkillController(this);
    }

    SetDestinationPosition(p: Point): void {
        this.destinyPosition.x = CutWidthWord(p.x);
        this.destinyPosition.y = CutHeightWord(p.y);
    }

    SetPlayerPos(p: Point): void {
        this.person.center.x = CutWidthPlayer(p.x);
        this.person.center.y = CutHeightPlayer(p.y);
    }

    UpdateDestinationPosition(posX: number, posY: number): ResponseToClient {
        this.SetDestinationPosition(new Point(posX, posY));

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
            posX: this.person.center.x,
            posY: this.person.center.y,
            skills: this.skillController.ToClient()
        };

        return response;
    }
}


export default Player;