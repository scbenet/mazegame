import { V2 } from './V2.js'
import { Maze } from './Maze.js'
import { Ball } from './Ball.js'

const pressed = new Set();

(() => {

    // Set up canvas and context
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Game variables
    const cellSize = 75;
    const wallThickness = 4;
    const ballSize = 15;
    const ballSpeed = 5;
    const ballColor = 'white';

    // Calculate the largest multiple of cellSize that fits within the screen
    const maxCanvasWidth = Math.floor(window.innerWidth / cellSize) * cellSize;
    const maxCanvasHeight = Math.floor(window.innerHeight / cellSize) * cellSize;

    // Set canvas dimensions to the largest multiple of cellSize
    canvas.width = maxCanvasWidth;
    canvas.height = maxCanvasHeight;

    // Center the canvas in the middle of the screen
    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - maxCanvasWidth) / 2}px`;
    canvas.style.top = `${(window.innerHeight - maxCanvasHeight) / 2}px`;

    const maze = new Maze(canvas.width, canvas.height, cellSize, wallThickness)

    const player = new Ball(
        new V2(25, 25),
        ballSize,
        ballSpeed,
        ballColor,
    );
    let gameWon = false;
    let startTime = Date.now()
    let endTime = null

    function drawWinScreen() {
        const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
        const coinsCollected = maze.getCollectedCoins();
        const totalCoins = maze.coins.length;

        // Calculate score
        const score = Math.floor(Math.max(0, coinsCollected * 100 - timeTaken * 5));

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '48px Arial';
        ctx.fillStyle = 'gold';
        ctx.textAlign = 'center';
        ctx.fillText('Level Complete!', canvas.width/2, canvas.height/2 - 60);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Time: ${timeTaken} seconds`, canvas.width/2, canvas.height/2 - 10);
        ctx.fillText(`Coins: ${coinsCollected}/${totalCoins}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 70);
        
        ctx.font = '18px Arial';
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 120);
    }

    function resetGame() {
        gameWon = false;
        startTime = Date.now();
        endTime = null;
        player.pos = new V2(25, 25);
        maze.generateMaze();
        maze.generateCoins(10);
    }

    // Animate
    function step(timestamp) {

        // Clear canvas before redrawing
        ctx.fillStyle = "rgb(51 51 51 / 50%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Move player
        maze.draw(ctx)
        player.draw(ctx, pressed, maze);

        if (!gameWon && maze.checkGoal(player)) {
            gameWon = true
            endTime = Date.now()
        }

        if (gameWon) {
            drawWinScreen()
        }

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    addEventListener('keydown', (event) => {
        if (event.code === 'Space' && gameWon) {
            resetGame();
        }
        const direction = keyMap[event.key];
        if (direction && !pressed.has(direction)) pressed.add(direction);
    });

    addEventListener('resize', () => {
        // Recalculate canvas dimensions and center it on resize
        const newMaxCanvasWidth = Math.floor(window.innerWidth / cellSize) * cellSize;
        const newMaxCanvasHeight = Math.floor(window.innerHeight / cellSize) * cellSize;

        canvas.width = newMaxCanvasWidth;
        canvas.height = newMaxCanvasHeight;

        canvas.style.left = `${(window.innerWidth - newMaxCanvasWidth) / 2}px`;
        canvas.style.top = `${(window.innerHeight - newMaxCanvasHeight) / 2}px`;

        // Regenerate maze and reset player position
        maze.updateDimensions(newMaxCanvasWidth, newMaxCanvasHeight);
        maze.generateMaze();
        player.pos = new V2(cellSize / 2, cellSize / 2);
    });

    const keyMap = {
        'w': 'w', 'ArrowUp': 'w',
        'a': 'a', 'ArrowLeft': 'a',
        's': 's', 'ArrowDown': 's',
        'd': 'd', 'ArrowRight': 'd',
    };
    
    addEventListener('keydown', (event) => {
        const direction = keyMap[event.key];
        if (direction && !pressed.has(direction)) pressed.add(direction);
    });
    
    addEventListener('keyup', (event) => {
        const direction = keyMap[event.key];
        if (direction && pressed.has(direction)) pressed.delete(direction);
    });
})();