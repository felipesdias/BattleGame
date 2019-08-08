import Player from "../Game/Player";

export default abstract class AbstractSkill {
    abstract Reset(): void;
    abstract ToClient(): any;
    abstract HandlerEvent(data: any, players: Map<number, Player>): ResponseToClient;
    abstract TickSkillPre(players: Map<number, Player>): void;
    abstract TickSkillPos(): void;
}