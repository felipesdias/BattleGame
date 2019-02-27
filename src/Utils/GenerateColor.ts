const colors = {
    red: 'red',
    blue: 'blue',
    black: 'black',
    orange: 'orange',
    purple: 'purple'
}

export function GetColorById(id: number): string {
    return Object.keys(colors).sort()[id];
}