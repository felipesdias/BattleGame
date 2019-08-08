const colors: { [s: string]: string; } = {
    red: '#ff0000',
    blue: '#0000ff',
    black: '#000000',
    orange: '#ffa500',
    purple: '#800080'
}

export function GetColorById(id: number): string {
    return colors[Object.keys(colors).sort()[id]];
}