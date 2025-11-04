console.log("script.js loaded");

// ----------------- ELEMENTS -----------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restart");
const resumeBtn = document.getElementById("resume");
const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("finalScore");
const scoreEl = document.getElementById("score");

const mobileButtons = document.querySelectorAll(".mobile-controls button");

// ----------------- GAME SETTINGS -----------------
const CANVAS_SIZE = 600;
const SNAKE_SIZE = 20;
const FPS = 10; // frames per second

let snake = [];
let direction = { x: 1, y: 0 }; // moving right initially
let food = { x: 0, y: 0 };
let score = 0;
let running = false;
let intervalId = null;

// ----------------- INITIALIZATION -----------------

function spawnFood() {
    const max = CANVAS_SIZE / SNAKE_SIZE - 1;
    food.x = Math.floor(Math.random() * max) * SNAKE_SIZE;
    food.y = Math.floor(Math.random() * max) * SNAKE_SIZE;

    // Ensure food does not spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
        }
    }
}

function resetGame() {
    snake = [
        { x: 300, y: 300 },
        { x: 280, y: 300 },
        { x: 260, y: 300 }
    ];
    direction = { x: 1, y: 0 };
    score = 0;
    spawnFood();
    running = false;
    clearInterval(intervalId);
    draw();
    hideOverlay();
    updateScoreDisplay();
}

// ----------------- DRAW FUNCTIONS -----------------

function drawSnake() {
    ctx.fillStyle = "white";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE));
}

function drawFood() {
    ctx.fillStyle = "turquoise";
    ctx.fillRect(food.x, food.y, SNAKE_SIZE, SNAKE_SIZE);
}

function updateScoreDisplay() {
    scoreEl.textContent = `Score: ${score}`;
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawSnake();
    drawFood();
}

// ----------------- GAME LOGIC -----------------

function moveSnake() {
    const newHead = {
        x: snake[0].x + direction.x * SNAKE_SIZE,
        y: snake[0].y + direction.y * SNAKE_SIZE
    };

    // Check collision with walls
    if (newHead.x < 0 || newHead.x >= CANVAS_SIZE || newHead.y < 0 || newHead.y >= CANVAS_SIZE) {
        endGame();
        return;
    }

    // Check collision with self
    for (let segment of snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
            endGame();
            return;
        }
    }

    snake.unshift(newHead); // add new head

    // Check collision with food
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        spawnFood();
        updateScoreDisplay();
    } else {
        snake.pop(); // remove tail
    }
}

// ----------------- GAME LOOP -----------------

function step() {
    moveSnake();
    draw();
}

// ----------------- CONTROL FUNCTIONS -----------------

function startLoop() {
    if (running) return;
    running = true;
    intervalId = setInterval(step, 1000 / FPS);
}

function stopLoop() {
    running = false;
    if (intervalId) clearInterval(intervalId);
}

function endGame() {
    stopLoop();
    finalScore.textContent = score;
    showOverlay();
}

function showOverlay() {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
}

function hideOverlay() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
}

// ----------------- INPUT HANDLERS -----------------

function setDirectionFromKey(key) {
    if (key === "ArrowUp" && direction.y !== 1) direction = { x: 0, y: -1 };
    if (key === "ArrowDown" && direction.y !== -1) direction = { x: 0, y: 1 };
    if (key === "ArrowLeft" && direction.x !== 1) direction = { x: -1, y: 0 };
    if (key === "ArrowRight" && direction.x !== -1) direction = { x: 1, y: 0 };
}

window.addEventListener("keydown", (e) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    setDirectionFromKey(e.key);
});

// Mobile buttons
mobileButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const d = btn.dataset.dir;
        if (d === "up") setDirectionFromKey("ArrowUp");
        if (d === "down") setDirectionFromKey("ArrowDown");
        if (d === "left") setDirectionFromKey("ArrowLeft");
        if (d === "right") setDirectionFromKey("ArrowRight");
    });
});

// ----------------- BUTTON EVENTS -----------------

startBtn.addEventListener("click", startLoop);
resumeBtn.addEventListener("click", () => { hideOverlay(); startLoop(); });
pauseBtn.addEventListener("click", stopLoop);
restartBtn.addEventListener("click", () => { resetGame(); startLoop(); });

// ----------------- START GAME -----------------

resetGame();
