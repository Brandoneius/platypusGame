const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

//Load in all images 

const platypusImage = new Image();
platypusImage.src = 'platypus.png';

const logLeft = new Image();
logLeft.src = 'log_left.png';

const logMiddle = new Image();
logMiddle.src = 'log_center.png';

const logRight = new Image();
logRight.src = 'log_right.png';

const eggImage = new Image();
eggImage.src = 'egg.png'; // Your egg pixel art image

const riverBackground = new Image();
riverBackground.src = 'river.png'; // Your seamless river background image

let backgroundY = 0; // Vertical position of the background

function drawBackground() {
    // Calculate the total height needed to cover the canvas, including the part offscreen
    const totalBackgroundHeight = canvas.height + riverBackground.height;

    for (let i = -riverBackground.height; i < totalBackgroundHeight; i += riverBackground.height) {
        ctx.drawImage(riverBackground, 0, backgroundY + i);
    }

    // Scroll the background
    backgroundY += 2; // Adjust the speed as needed

    // Reset background position
    if (backgroundY >= riverBackground.height) {
        backgroundY = 0;
    }
}


//Initialize platypus object
let platypus = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 60,
    height: 40,
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
    if (platypusImage.complete) { // Check if image is loaded
        ctx.drawImage(platypusImage, platypus.x, platypus.y, platypus.width, platypus.height);
    }
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
let obstacleInterval = 120; // Interval (in frames) for new obstacles
let frame = 0; // Frame counter

// Draw an obstacle
function drawObstacle(obstacle) {
    ctx.fillStyle = '#3e2723'; // Placeholder color for obstacles
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// Define the desired size for log segments
const logSegmentWidth = 50; // Adjust as needed
const logSegmentHeight = 50; // Adjust as needed

function drawLogObstacle(obstacle) {
    // Calculate the number of middle segments needed
    const middleSectionWidth = obstacle.width - (logSegmentWidth * 2); // Subtract the width of left and right segments
    const middleRepeats = Math.ceil(middleSectionWidth / logSegmentWidth);

    // Draw the left segment
    ctx.drawImage(logLeft, obstacle.x, obstacle.y, logSegmentWidth, logSegmentHeight);

    // Draw the middle segments
    for (let i = 0; i < middleRepeats; i++) {
        ctx.drawImage(logMiddle, obstacle.x + logSegmentWidth + i * logSegmentWidth, obstacle.y, logSegmentWidth, logSegmentHeight);
    }

    // Draw the right segment
    ctx.drawImage(logRight, obstacle.x + logSegmentWidth + middleRepeats * logSegmentWidth, obstacle.y, logSegmentWidth, logSegmentHeight);
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
        drawLogObstacle(ob); // Draw log
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

// Define the desired size for the egg
const eggWidth = 20; // Adjust as needed
const eggHeight = 20; // Adjust as needed


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
        let newEgg = new Egg(eggX, 0, 10, 10, 2); // Egg spawns at the top with a speed of 2

        if (!isOverlappingWithObstacles(newEgg)) {
            eggs.push(newEgg);
        }
    }
}

// Modify drawEgg function to adjust the size and check collection
function drawEgg(egg) {
    if (!egg.collected) {
        ctx.drawImage(eggImage, egg.x, egg.y, eggWidth, eggHeight);
    }
}


// Update updateEggs function to ensure proper collection logic
function updateEggs() {
    for (let i = 0; i < eggs.length; i++) {
        let egg = eggs[i];

        if (!egg.collected) {
            egg.y += egg.speed;

            // Check if the platypus collects the egg
            if (platypus.x < egg.x + eggWidth &&
                platypus.x + platypus.width > egg.x &&
                platypus.y < egg.y + eggHeight &&
                platypus.height + platypus.y > egg.y) {
                egg.collected = true; // Mark the egg as collected
                platypus.eggs++; // Increase egg count

                // Increase life for every 10 eggs collected
                if (platypus.eggs % 10 === 0) {
                    platypus.lives++;
                }
            } else {
                drawEgg(egg);
            }
        }
    }

    // Remove collected eggs from the array
    eggs = eggs.filter(egg => !egg.collected);
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
    ctx.fillText('Lives: ' + platypus.lives, 20, 20);
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
        drawBackground(); // Draw the moving background first
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

