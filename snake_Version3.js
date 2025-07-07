// Mobile responsive Snake game with max 10 fruits and winning message

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const scoreDiv = document.getElementById('score');
const controls = document.getElementById('controls');
let width, height, block, COLS, ROWS;

function resize() {
  width = Math.min(window.innerWidth, window.innerHeight) * 0.98;
  height = width;
  block = Math.floor(width / 20);
  COLS = Math.floor(width / block);
  ROWS = Math.floor(height / block);
  canvas.width = COLS * block;
  canvas.height = ROWS * block;
}
resize();
window.addEventListener('resize', () => {
  resize();
  // Optionally, restart the game on resize if field size changes
});

let snake, dir, nextDir, fruit, score, maxScore, gameOver, won;

// Initialize game state
function initGame() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  nextDir = {...dir};
  score = 0;
  maxScore = 10;
  fruit = spawnFruit();
  gameOver = false;
  won = false;
  messageDiv.style.display = 'none';
}
initGame();

function spawnFruit() {
  let f;
  do {
    f = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake.some(s => s.x === f.x && s.y === f.y));
  return f;
}

function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fruit
  ctx.fillStyle = "red";
  ctx.fillRect(fruit.x * block, fruit.y * block, block, block);

  // Snake
  for (let i = 0; i < snake.length; ++i) {
    ctx.fillStyle = i === 0 ? "#0f0" : "#8f8";
    ctx.fillRect(snake[i].x * block, snake[i].y * block, block, block);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x * block, snake[i].y * block, block, block);
  }
}

function update() {
  if (gameOver || won) return;

  dir = {...nextDir};
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // Wall or self collision
  if (
    head.x < 0 || head.x >= COLS ||
    head.y < 0 || head.y >= ROWS ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    gameOver = true;
    showMessage('Game Over!<br><small>Tap or Press Any Key<br>to Restart</small>');
    return;
  }

  snake.unshift(head);

  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    if (score >= maxScore) {
      won = true;
      showMessage('🎉 You Win! 🎉<br><small>Tap or Press Any Key<br>to Play Again</small>');
      return;
    }
    fruit = spawnFruit();
  } else {
    snake.pop();
  }
}

function showMessage(msg) {
  messageDiv.innerHTML = msg;
  messageDiv.style.display = 'block';
}

function hideMessage() {
  messageDiv.style.display = 'none';
}

function drawScore() {
  scoreDiv.textContent = `Score: ${score} / ${maxScore}`;
}

function loop() {
  update();
  draw();
  drawScore();
  setTimeout(loop, 120);
}
loop();

// Direction change logic
function setDirection(dx, dy) {
  // Prevent reversing
  if (gameOver || won) return;
  if (dx === -dir.x && dy === -dir.y) return;
  nextDir = {x: dx, y: dy};
}

// Touch gestures
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});
canvas.addEventListener('touchend', e => {
  if (gameOver || won) {
    restart();
    return;
  }
  const t = e.changedTouches[0];
  let dx = t.clientX - touchStartX;
  let dy = t.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20) setDirection(1, 0);
    else if (dx < -20) setDirection(-1, 0);
  } else {
    if (dy > 20) setDirection(0, 1);
    else if (dy < -20) setDirection(0, -1);
  }
});

// Keyboard controls
window.addEventListener('keydown', e => {
  if (gameOver || won) {
    restart();
    return;
  }
  if (e.key === 'ArrowUp') setDirection(0, -1);
  else if (e.key === 'ArrowDown') setDirection(0, 1);
  else if (e.key === 'ArrowLeft') setDirection(-1, 0);
  else if (e.key === 'ArrowRight') setDirection(1, 0);
});

// On-screen button controls (fixed: proper event and layout)
document.getElementById('up').addEventListener('touchstart', e => { e.preventDefault(); setDirection(0, -1); });
document.getElementById('down').addEventListener('touchstart', e => { e.preventDefault(); setDirection(0, 1); });
document.getElementById('left').addEventListener('touchstart', e => { e.preventDefault(); setDirection(-1, 0); });
document.getElementById('right').addEventListener('touchstart', e => { e.preventDefault(); setDirection(1, 0); });

document.getElementById('up').addEventListener('click', () => setDirection(0, -1));
document.getElementById('down').addEventListener('click', () => setDirection(0, 1));
document.getElementById('left').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('right').addEventListener('click', () => setDirection(1, 0));

// Restart game
function restart() {
  initGame();
  draw();
  drawScore();
}

// Click anywhere to restart (when over)
canvas.addEventListener('mousedown', () => {
  if (gameOver || won) restart();
});
messageDiv.addEventListener('touchstart', restart);
messageDiv.addEventListener('mousedown', restart);