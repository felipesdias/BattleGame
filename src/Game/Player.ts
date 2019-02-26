import { Circle, Point, Dist } from "../Utils/Geometry";
import ServerConstants from "../Utils/ServerConstants";
import { CutHeightPlayer, CutHeightWord, CutWidthWord, CutWidthPlayer } from "../Utils/Utils";
import SkillController from "./Skills/SkillController";

class Player {
    public id: number;
    public person: Circle;
    public mousePosition: Point;
    public skillController: SkillController;

    constructor(_id: number) {
        this.id = _id;
        this.mousePosition = new Point(
            (ServerConstants.World.Width - ServerConstants.Player.Raio) * Math.random(),
            (ServerConstants.World.Height - ServerConstants.Player.Raio) * Math.random()
        );

        this.person = new Circle(this.mousePosition.Clone(), ServerConstants.Player.Raio);
        this.skillController = new SkillController(this);
    }

    UpdateMousePos(posX: number, posY: number): void {
        this.mousePosition.x = CutWidthWord(posX);
        this.mousePosition.y = CutHeightWord(posY);
    }

    SetPlayerPos(p: Point): void {
        this.person.center.x = CutWidthPlayer(p.x);
        this.person.center.y = CutHeightPlayer(p.y);
    }

    UpdatePlayerPos(): void {
        let move: Point;

        if (Dist(this.person.center, this.mousePosition) > ServerConstants.Player.Velocity) {
            move = this.mousePosition
                .Sub(this.person.center)
                .Normalized()
                .Mult(ServerConstants.Player.Velocity);
        }
        else {
            move = this.mousePosition.Sub(this.person.center);
        }

        this.SetPlayerPos(this.person.center.Add(move));
    }
}


export default Player;