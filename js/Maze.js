import { V2 } from './V2.js'
import { Coin } from './Coin.js'

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        this.visited = false;
    }
}

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.fillStyle = '#555';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(ball) {
        return (ball.pos.x + ball.radius > this.x &&
                ball.pos.x - ball.radius < this.x + this.width &&
                ball.pos.y + ball.radius > this.y &&
                ball.pos.y - ball.radius < this.y + this.height);
    }
}

class Goal {
    constructor(x, y, cellSize) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize
        this.glowAmount = 0;
        this.glowDirection = 0.025;
    }

    draw(context) {
        // Animate the goal with a pulsing effect
        this.glowAmount += this.glowDirection;
        if (this.glowAmount > 1 || this.glowAmount < 0) {
            this.glowDirection *= -1;
        }

        // Fill the entire cell
        context.fillStyle = `rgba(255, 215, 0, ${0.3 + this.glowAmount * 0.2})`;
        context.fillRect(this.x * this.cellSize + 5, this.y * this.cellSize + 5, 
                        this.cellSize - 10, this.cellSize - 10);

        const centerX = this.x * this.cellSize + this.cellSize / 2;
        const centerY = this.y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize * 0.3;

        context.beginPath();
        context.arc(centerX, centerY, size, 0, Math.PI * 2);
        context.fillStyle = 'gold';
        context.fill();
    }

    checkCollision(ball) {
        const cellLeft = this.x * this.cellSize;
        const cellTop = this.y * this.cellSize;
        
        return (
            ball.pos.x + ball.radius > cellLeft &&
            ball.pos.x - ball.radius < cellLeft + this.cellSize &&
            ball.pos.y + ball.radius > cellTop &&
            ball.pos.y - ball.radius < cellTop + this.cellSize
        );
    }
}

export class Maze {
    constructor(width, height, cellSize, wallThickness=5) {
        this.cellSize = cellSize;
        this.wallThickness = wallThickness
        this.updateDimensions(width, height); // Initialize dimensions
        this.walls = [];
        this.coins = [];
        this.generateMaze();
        this.generateCoins(10);
    }

    generateCoins(numCoins) {
        this.coins = [];
        for (let i = 0; i < numCoins; i++) {
            let x, y;
            do {
                // Randomly place coins in the maze
                x = Math.floor(Math.random() * this.cols) * this.cellSize + this.cellSize / 2;
                y = Math.floor(Math.random() * this.rows) * this.cellSize + this.cellSize / 2;
            } while (this.isCoinOverlappingWalls(x, y) || this.isCoinOverlappingGoal(x, y));

            this.coins.push(new Coin(x, y));
        }
    }

    isCoinOverlappingWalls(x, y) {
        // Check if a coin overlaps with any wall
        return this.walls.some(wall => wall.checkCollision({ pos: new V2(x, y), radius: 10 }));
    }

    isCoinOverlappingGoal(x, y) {
        // Check if a coin overlaps with the goal
        return this.goal.checkCollision({ pos: new V2(x, y), radius: 10 });
    }

    // Method to update dimensions and recalculate cols/rows
    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.cols = Math.floor(width / this.cellSize);
        this.rows = Math.floor(height / this.cellSize);
        this.cells = []; // Reset cells array
        // Place goal in the bottom-right cell
        this.goal = new Goal(this.cols - 1, this.rows - 1, this.cellSize);
    }

    generateMaze() {

        // Initialize grid of cells
        for (let y = 0; y < this.rows; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.cells[y][x] = new Cell(x, y);
            }
        }

        // Generate maze using recursive backtracking
        this.recursiveBacktrack(0, 0);
        
        // Convert cells to walls
        this.createWalls();
    }

    recursiveBacktrack(x, y) {
        const current = this.cells[y][x];
        current.visited = true;

        // Get unvisited neighbors
        const neighbors = this.getUnvisitedNeighbors(x, y);
        
        // Randomize neighbors order
        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }

        // Visit each unvisited neighbor
        for (const neighbor of neighbors) {
            if (!this.cells[neighbor.y][neighbor.x].visited) {
                // Remove walls between current and neighbor
                if (neighbor.x > x) { // Right
                    current.walls.right = false;
                    this.cells[neighbor.y][neighbor.x].walls.left = false;
                }
                else if (neighbor.x < x) { // Left
                    current.walls.left = false;
                    this.cells[neighbor.y][neighbor.x].walls.right = false;
                }
                else if (neighbor.y > y) { // Bottom
                    current.walls.bottom = false;
                    this.cells[neighbor.y][neighbor.x].walls.top = false;
                }
                else if (neighbor.y < y) { // Top
                    current.walls.top = false;
                    this.cells[neighbor.y][neighbor.x].walls.bottom = false;
                }

                this.recursiveBacktrack(neighbor.x, neighbor.y);
            }
        }
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        
        if (y > 0) neighbors.push({x: x, y: y-1});           // Top
        if (x < this.cols-1) neighbors.push({x: x+1, y: y}); // Right
        if (y < this.rows-1) neighbors.push({x: x, y: y+1}); // Bottom
        if (x > 0) neighbors.push({x: x-1, y: y});           // Left

        return neighbors.filter(n => !this.cells[n.y][n.x].visited);
    }

    createWalls() {
        this.walls = [];

        // Add outer walls
        this.walls.push(new Wall(0, 0, this.width, this.wallThickness));                                // Top
        this.walls.push(new Wall(0, this.height - this.wallThickness, this.width, this.wallThickness)); // Bottom
        this.walls.push(new Wall(0, 0, this.wallThickness, this.height));                               // Left
        this.walls.push(new Wall(this.width - this.wallThickness, 0, this.wallThickness, this.height)); // Right

        // Add inner walls
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.cells[y][x];
                const cellX = x * this.cellSize;
                const cellY = y * this.cellSize;

                if (cell.walls.top) {
                    this.walls.push(new Wall(
                        cellX, 
                        cellY, 
                        this.cellSize + this.wallThickness, 
                        this.wallThickness
                    ));
                }
                if (cell.walls.right) {
                    this.walls.push(new Wall(
                        cellX + this.cellSize, 
                        cellY, 
                        this.wallThickness, 
                        this.cellSize + this.wallThickness
                    ));
                }
            }
        }
    }

    draw(context) {
        this.walls.forEach(wall => wall.draw(context));
        this.coins.forEach(coin => coin.draw(context))
        this.goal.draw(context)
    }

    checkCoinCollisions(ball) {
        // Check if the ball collides with any coin
        this.coins.forEach(coin => {
            if (coin.checkCollision(ball)) {
                coin.collected = true;
            }
        });
    }

    getCollectedCoins() {
        // Count how many coins have been collected
        return this.coins.filter(coin => coin.collected).length;
    }

    checkGoal(ball) {
        return this.goal.checkCollision(ball)
    }

    checkCollisions(ball) {
        return this.walls.some(wall => wall.checkCollision(ball));
    }
}