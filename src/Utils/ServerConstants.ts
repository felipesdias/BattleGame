const playerRaio: number = 12;

export default {
    EPS: 1e-9,
    GameController: {
        NumberOfPlayers: 5
    },
    World: {
        Width: 800,
        Height: 800
    },
    Player: {
        Raio: playerRaio,
        Velocity: 10
    },
    Skills: {
        Blink: {
            Countdown: 1500,
            ProtectZone: 50 + playerRaio
        },
        Shuriken: {
            Raio: 10,
            Velocity: 15
        }
    }
};