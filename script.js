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
    lift: -5,
    eggs: 0,
    lives: 3, // Number of lives
    invulnerable: false, // Is platypus currently invulnerable?
    invulnerabilityDuration: 120, // Frames of invincibility after being hit
    invulnerabilityTimer: 0 // Timer for invincibility duration
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

// Modified Egg constructor for downward movement
function Egg(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.collected = false;
}


// Array to store eggs
let eggs = [];
let eggSpawnRate = 100; // Rate at which eggs spawn (in frames)

// Function to check for overlap with obstacles
function isOverlappingWithObstacles(egg) {
    for (let i = 0; i < obstacles.length; i++) {
        let ob = obstacles[i];
        if (egg.x < ob.x + ob.width &&
            egg.x + egg.width > ob.x &&
            egg.y < ob.y + ob.height &&
            egg.height + egg.y > ob.y) {
            return true;
        }
    }
    return false;
}

// Spawn eggs
// Modified spawnEggs function
function spawnEggs() {
    if (frame % eggSpawnRate === 0) {
        let eggX = Math.floor(Math.random() * (canvas.width - 20));
        let newEgg = new Egg(eggX, 0, 20, 20, 2); // Egg spawns at the top with a speed of 2

        if (!isOverlappingWithObstacles(newEgg)) {
            eggs.push(newEgg);
        }
    }
}

// Draw an egg
function drawEgg(egg) {
    if (!egg.collected) {
        ctx.fillStyle = '#fdd835'; // Placeholder color for eggs
        ctx.fillRect(egg.x, egg.y, egg.width, egg.height);
    }
}

// Modified updateEggs function
function updateEggs() {
    for (let i = 0; i < eggs.length; i++) {
        let egg = eggs[i];

        if (!egg.collected) {
            egg.y += egg.speed; // Move egg downward

            // Check if the platypus collects the egg
            if (platypus.x < egg.x + egg.width &&
                platypus.x + platypus.width > egg.x &&
                platypus.y < egg.y + egg.height &&
                platypus.height + platypus.y > egg.y) {
                egg.collected = true;
                platypus.eggs++; // Increase score or egg count
            }

            drawEgg(egg);
        }
    }

    // Remove eggs that are out of the canvas
    eggs = eggs.filter(egg => egg.y <= canvas.height);
}

// Modify the updateGame function to include egg logic
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlatypusPosition();
    spawnEggs();
    updateEggs();
    updateObstacles();
    drawPlatypus();
    requestAnimationFrame(updateGame);
}

updateGame();

