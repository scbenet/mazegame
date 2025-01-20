import { V2 } from './V2.js'

export class Coin {
    constructor(x, y, size = 10) {
        this.pos = new V2(x, y);
        this.size = size;
        this.collected = false;
    }

    draw(context) {
        if (!this.collected) {
            context.beginPath();
            context.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
            context.fillStyle = 'gold';
            context.fill();
        }
    }

    checkCollision(ball) {
        if (this.collected) return false;
        const dx = this.pos.x - ball.pos.x;
        const dy = this.pos.y - ball.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + ball.radius;
    }
}