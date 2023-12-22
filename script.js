const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let platypus = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speedY: 0,
    gravity: 0.25,
    lift: -5, // Upward force when the up arrow key is pressed
    eggs: 0
};

// Key controls for platypus movement
let keys = {
    right: false,
    left: false,
    up: false
};

function keyDownHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
        keys.right = true;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        keys.left = true;
    } else if (event.key === "Up" || event.key === "ArrowUp") {
        keys.up = true;
    }
}

function keyUpHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
        keys.right = false;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        keys.left = false;
    } else if (event.key === "Up" || event.key === "ArrowUp") {
        keys.up = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function drawPlatypus() {
    ctx.fillStyle = '#795548'; // Placeholder color for the platypus
    ctx.fillRect(platypus.x, platypus.y, platypus.width, platypus.height);
}

// Obstacle constructor
function Obstacle(x, width, speed) {
    this.x = x;
    this.y = 0 - width; // Start above the canvas
    this.width = width;
    this.height = 60; // Example height
    this.speed = speed;
}

// Array to store obstacles
let obstacles = [];
let obstacleInterval = 150; // Interval (in frames) for new obstacles
let frame = 0; // Frame counter

// Draw an obstacle
function drawObstacle(obstacle) {
    ctx.fillStyle = '#3e2723'; // Placeholder color for obstacles
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// Update obstacles and check for collisions
function updateObstacles() {
    if (frame % obstacleInterval === 0) {
        let minWidth = 50;
        let maxWidth = 150;
        let width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
        let x = Math.floor(Math.random() * (canvas.width - width));
        obstacles.push(new Obstacle(x, width, 2));
    }

    for (let i = 0; i < obstacles.length; i++) {
        let ob = obstacles[i];
        ob.y += ob.speed;

        // Collision detection
        if (platypus.x < ob.x + ob.width &&
            platypus.x + platypus.width > ob.x &&
            platypus.y < ob.y + ob.height &&
            platypus.height + platypus.y > ob.y) {
            // Collision detected - handle accordingly
        }

        drawObstacle(ob);
    }

    // Remove obstacles out of the canvas
    obstacles = obstacles.filter(ob => ob.y <= canvas.height);

    frame++;
}

function updatePlatypusPosition() {
    // Horizontal movement
    if (keys.right && platypus.x + platypus.width < canvas.width) {
        platypus.x += 5;
    }
    if (keys.left && platypus.x > 0) {
        platypus.x -= 5;
    }

    // Vertical movement
    if (keys.up) {
        platypus.speedY = platypus.lift;
    }

    // Apply gravity
    platypus.y += platypus.speedY;
    platypus.speedY += platypus.gravity;

    // Boundary checks
    if (platypus.y <= 0) {
        platypus.y = 0;
    } else if (platypus.y + platypus.height >= canvas.height) {
        platypus.y = canvas.height - platypus.height;
        // Implement game over logic or life reduction here
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlatypusPosition();
    updateObstacles();
    drawPlatypus();
    requestAnimationFrame(updateGame);
}

updateGame();
