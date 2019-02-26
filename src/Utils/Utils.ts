import ServerConstants from "./ServerConstants";

export function CutWidthWord(x: number): number {
    return Math.min(ServerConstants.World.Width, Math.max(0, x));
}

export function CutHeightWord(y: number): number {
    return Math.min(ServerConstants.World.Height, Math.max(0, y));
}

export function CutWidthPlayer(x: number): number {
    return Math.min(ServerConstants.World.Width - ServerConstants.Player.Raio,
        Math.max(0 + ServerConstants.Player.Raio, x));
}

export function CutHeightPlayer(y: number): number {
    return Math.min(ServerConstants.World.Height - ServerConstants.Player.Raio,
        Math.max(0 + ServerConstants.Player.Raio, y));
}

export function GetTimeStamp(): number {
    return (new Date()).getTime();
}