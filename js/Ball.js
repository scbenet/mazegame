import { V2 } from './V2.js'

const directions = {
    'w': new V2(0, -1),
    'a': new V2(-1, 0),
    's': new V2(0, 1),
    'd': new V2(1, 0),
}

export class Ball {
    constructor(pos, radius=25, speed=5, color='white', vel=new V2(0, 0)) {
        this.pos = pos;
        this.radius = radius;
        this.speed = speed;
        this.color = color;
        this.vel = vel;
    }

    updateVelocity(pressed) {
        this.vel = new V2(0, 0);
        for (const key of pressed) {
            this.vel = this.vel.add(directions[key].scale(this.speed));
        }
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    draw(context, pressed, maze) {

        this.updateVelocity(pressed);

        // Store previous position
        const prevPos = new V2(this.pos.x, this.pos.y);

        // Try moving in the x direction first
        this.pos.x = this.clamp(this.pos.x + this.vel.x, this.radius, canvas.width - this.radius);

        // Check for wall collisions after moving in the x direction
        if (maze.checkCollisions(this)) {
            // If collision, revert x position
            this.pos.x = prevPos.x;
        }

        // Try moving in the y direction next
        this.pos.y = this.clamp(this.pos.y + this.vel.y, this.radius, canvas.height - this.radius);

        // Check for wall collisions after moving in the y direction
        if (maze.checkCollisions(this)) {
            // If collision, revert y position
            this.pos.y = prevPos.y;
        }
    
        // Check for wall collisions
        if (maze.checkCollisions(this)) {
            // If collision, revert to previous position
            this.pos = prevPos;
        }

        maze.checkCoinCollisions(this)

        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
}