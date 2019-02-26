import Constants from "../Utils/ServerConstants";
import { Circle, Point, Dist } from "../Utils/Geometry";
import ServerConstants from "../Utils/ServerConstants";
import { CutHeightPlayer, CutHeightWord, CutWidthWord, CutWidthPlayer } from "../Utils/Utils";

class Player {
    public id: number;
    public person: Circle;
    public mousePosition: Point;

    constructor(_id: number) {
        this.id = _id;
        this.mousePosition = new Point(
            (ServerConstants.World.Width - ServerConstants.Player.Raio) * Math.random(),
            (ServerConstants.World.Height - ServerConstants.Player.Raio) * Math.random()
        );

        this.person = new Circle(this.mousePosition.Clone(), ServerConstants.Player.Raio);
    }

    UpdateMousePos(posX: number, posY: number): void {
        this.mousePosition.x = CutWidthWord(posX);
        this.mousePosition.y = CutHeightWord(posY);
    }

    SetPlayerPos(p: Point): void {
        this.person.center.x = CutWidthPlayer(this.person.center.x + p.x);
        this.person.center.y = CutHeightPlayer(this.person.center.y + p.y);
    }

    UpdatePlayerPos(): void {
        if (Dist(this.person.center, this.mousePosition) > ServerConstants.Player.Velocity) {
            const move: Point = this.mousePosition
                .Sub(this.person.center)
                .Normalized()
                .Mult(ServerConstants.Player.Velocity);

            this.SetPlayerPos(move);
        }
    }
}

export default Player;