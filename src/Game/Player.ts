import Constants from "../Utils/ServerConstants";
import { Circle, Point } from "../Utils/Geometry";
import ServerConstants from "../Utils/ServerConstants";

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
}

export default Player;