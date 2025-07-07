// Mobile Snake game with a red border drawn inside the canvas

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const scoreDiv = document.getElementById('score');

let width, height, block, COLS, ROWS, borderWidth;
function resize() {
  // Always leave room for the border inside the canvas
  width = Math.min(window.innerWidth, window.innerHeight) * 0.98;
  height = width;
  borderWidth = 6; // px, for red border
  block = Math.floor((width - borderWidth * 2) / 20);
  COLS = Math.floor((width - borderWidth * 2) / block);
  ROWS = Math.floor((height - borderWidth * 2) / block);
  // Resize canvas so border fits exactly
  canvas.width = COLS * block + borderWidth * 2;
  canvas.height = ROWS * block + borderWidth * 2;
}
resize();
window.addEventListener('resize', () => {
  resize();
  restart();
});

let snake, dir, nextDir, fruit, score, maxScore, gameOver, won;

function initGame() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  nextDir = {...dir};
  score = 0;
  maxScore = 3;
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
  // Fill background
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw red border inside canvas
  ctx.save();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = "red";
  ctx.strokeRect(
    borderWidth/2, borderWidth/2, 
    canvas.width - borderWidth, 
    canvas.height - borderWidth
  );
  ctx.restore();

  // Draw fruit
  ctx.fillStyle = "red";
  ctx.fillRect(
    fruit.x * block + borderWidth, 
    fruit.y * block + borderWidth, 
    block, block
  );

  // Draw snake
  for (let i = 0; i < snake.length; ++i) {
    ctx.fillStyle = i === 0 ? "#0f0" : "#8f8";
    ctx.fillRect(
      snake[i].x * block + borderWidth, 
      snake[i].y * block + borderWidth, 
      block, block
    );
    ctx.strokeStyle = "#111";
    ctx.strokeRect(
      snake[i].x * block + borderWidth, 
      snake[i].y * block + borderWidth, 
      block, block
    );
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
    showMessage('Swami akta akta abhyas kartana sapadla !<br><small>Tap or Press Any Key<br>to Restart</small>');
    return;
  }

  snake.unshift(head);

  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    if (score >= maxScore) {
      won = true;
      showMessage('🎉 swami ne top kela akta akta abhyas karun ! 🎉<br><small>Tap or Press Any Key<br>to Play Again</small>');
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

// On-screen button controls
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
