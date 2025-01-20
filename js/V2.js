export class V2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        if (other instanceof V2) {
            return new V2(this.x + other.x, this.y + other.y);
        }
        else {
            throw new TypeError(`Error: cannot add Object of type ${typeof other} to V2`);
        }
    }

    scale(s) {
        if (typeof s === 'number') {
            return new V2(this.x * s, this.y * s);
        }
        else {
            throw new TypeError(`Error: cannot scale V2 by Object of type ${typeof s}`);
        }
    }

    sub(other) {
        return this.add(other.scale(-1))
    }
}