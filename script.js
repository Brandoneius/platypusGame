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
    lives: 1, // Number of lives
    invulnerable: false, // Is platypus currently invulnerable?
    invulnerabilityDuration: 120, // Frames of invincibility after being hit
    invulnerabilityTimer: 1 // Timer for invincibility duration
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
        if (!platypus.invulnerable && platypus.x < ob.x + ob.width &&
            platypus.x + platypus.width > ob.x &&
            platypus.y < ob.y + ob.height &&
            platypus.height + platypus.y > ob.y) {
            platypus.lives -= 1; // Lose a life
            platypus.invulnerable = true; // Start invulnerability
            platypus.invulnerabilityTimer = platypus.invulnerabilityDuration;
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
            egg.y += egg.speed;

            // Check if the platypus collects the egg
            if (platypus.x < egg.x + egg.width &&
                platypus.x + platypus.width > egg.x &&
                platypus.y < egg.y + egg.height &&
                platypus.height + platypus.y > egg.y) {
                egg.collected = true;
                platypus.eggs++; // Increase egg count

                // Increase life for every 10 eggs collected
                if (platypus.eggs % 10 === 0) {
                    platypus.lives++;
                }
            }

            drawEgg(egg);
        }
    }

    // Remove eggs out of the canvas
    eggs = eggs.filter(egg => egg.y <= canvas.height);
}


// Update platypus invulnerability
function updateInvulnerability() {
    if (platypus.invulnerable) {
        platypus.invulnerabilityTimer--;
        if (platypus.invulnerabilityTimer <= 0) {
            platypus.invulnerable = false;
        }
    }
}

// Shake effect for the platypus when hit
function drawShakingPlatypus() {
    if (platypus.invulnerable) {
        // Shake effect logic
        ctx.save();
        ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
        drawPlatypus();
        ctx.restore();
    } else {
        drawPlatypus();
    }
}

// Function to display the number of lives
function drawLives() {
    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Lives: ' + platypus.lives, 10, 20);
}

// Function to display the number of eggs collected
function drawEggCount() {
    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Eggs: ' + platypus.eggs, canvas.width - 100, 20);
}


//Adding function to allow the user to restart the game
let gameOver = false;
let gameStarted = false;

// Function to display the 'Press Enter to Start/Restart' prompt
function drawStartRestartPrompt() {
    ctx.fillStyle = 'green';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 40);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(gameOver ? 'Press Enter to Restart' : 'Press Enter to Start', canvas.width / 2, canvas.height / 2 + 75);
}

// Function to reset the game
function resetGame() {
    platypus.x = canvas.width / 2;
    platypus.y = canvas.height - 60;
    platypus.eggs = 0;
    platypus.lives = 3;
    platypus.invulnerable = false;
    obstacles = [];
    eggs = [];
    frame = 0;
    gameOver = false;
    gameStarted = true; // Set game as started
    updateGame();
}

// Event listener for keydown event
document.addEventListener('keydown', function (event) {
    if (event.key === "Enter") {
        if (!gameStarted || gameOver) {
            resetGame();
        }
    }
});


// Modify the updateGame function to check for game over
function updateGame() {

    if (!gameStarted) {
        drawStartRestartPrompt();
        return; // Wait for the player to start the game
    }

    if (platypus.lives > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updatePlatypusPosition();
        updateInvulnerability();
        spawnEggs();
        updateEggs();
        updateObstacles();
        drawShakingPlatypus();
        drawLives();
        drawEggCount();
        requestAnimationFrame(updateGame);
    } else {
        // Game Over logic
        ctx.font = '36px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center'; // Align text to the center
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);

        // Display the number of eggs saved
        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('You saved ' + platypus.eggs + ' eggs!', canvas.width / 2, canvas.height / 2 + 30);

        drawStartRestartPrompt();
        gameOver = true;
    }

}

updateGame();

