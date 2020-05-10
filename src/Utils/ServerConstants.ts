const playerRaio: number = 12;

export default {
    EPS: 1e-9,
    GameController: {
        NumberOfPlayers: 10
    },
    World: {
        Width: 800,
        Height: 800
    },
    Player: {
        Raio: playerRaio,
        Velocity: 10,
        RespawnTime: 3000
    },
    Skills: {
        Blink: {
            Countdown: 1250,
            ProtectZone: 50 + playerRaio
        },
        Shuriken: {
            Raio: 10,
            Velocity: 12
        },
        Shield: {
            Countdown: 7500,
            Duration: 2500,
            ProtectedArea: 10
        }
    }
};