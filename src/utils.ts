export function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

export function randomString(length) {
    const symbols = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let str = '';

    for (let i = 0; i < length; i++) {
        str += symbols[randomInteger(0, symbols.length - 1)]
    }

    return str;
}