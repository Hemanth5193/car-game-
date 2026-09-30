const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameActive = false;
let score = 0;
let baseSpeed = 5;
let currentSpeed = baseSpeed;
let roadOffset = 0;
let animationFrameId;

// Controls
const keys = {
  Left: false,
  Right: false
};

// Player Car
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 100,
  width: 40,
  height: 70,
  speed: 6,
  color: '#ff4757'
};

// Traffic Cars
let traffic = [];
const trafficColors = ['#2ed573', '#1e90ff', '#ffa502', '#9b59b6'];

// Event Listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.Left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.Right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.Left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.Right = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
  score = 0;
  currentSpeed = baseSpeed;
  traffic = [];
  player.x = canvas.width / 2 - player.width / 2;
  gameActive = true;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  gameLoop();
}

function spawnTraffic() {
  const lanes = [70, 170, 270];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  const color = trafficColors[Math.floor(Math.random() * trafficColors.length)];

  // Prevent spawning directly on top of another car
  const tooClose = traffic.some(car => car.y < 120 && Math.abs(car.x - lane) < 20);
  if (!tooClose) {
    traffic.push({
      x: lane,
      y: -80,
      width: 40,
      height: 70,
      speed: Math.random() * 2 + 2,
      color: color
    });
  }
}

function update() {
  if (!gameActive) return;

  // Move Player
  const roadLeft = 50;
  const roadRight = canvas.width - 50 - player.width;

  if (keys.Left && player.x > roadLeft) {
    player.x -= player.speed;
  }
  if (keys.Right && player.x < roadRight) {
    player.x += player.speed;
  }

  // Scroll Road
  roadOffset += currentSpeed;
  if (roadOffset >= 40) roadOffset = 0;

  // Update Score & Speed Progression
  score += 1;
  currentSpeed = baseSpeed + Math.floor(score / 500) * 0.5;
  
  scoreEl.textContent = `Score: ${Math.floor(score / 10)}`;
  speedEl.textContent = `Speed: ${Math.floor(currentSpeed * 15)} km/h`;

  // Spawn Traffic
  if (Math.random() < 0.02) {
    spawnTraffic();
  }

  // Update Traffic Position & Collision Check
  for (let i = traffic.length - 1; i >= 0; i--) {
    let car = traffic[i];
    car.y += currentSpeed - car.speed;

    // Collision Detection (AABB)
    if (
      player.x < car.x + car.width &&
      player.x + player.width > car.x &&
      player.y < car.y + car.height &&
      player.y + player.height > car.y
    ) {
      endGame();
      return;
    }

    // Remove Off-screen Cars
    if (car.y > canvas.height + 100) {
      traffic.splice(i, 1);
    }
  }
}

function drawCar(x, y, width, height, color) {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();

  // Roof / Windshield
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 5, y + 15, width - 10, 25);

  // Wheels
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 3, y + 8, 4, 14);
  ctx.fillRect(x + width - 1, y + 8, 4, 14);
  ctx.fillRect(x - 3, y + height - 22, 4, 14);
  ctx.fillRect(x + width - 1, y + height - 22, 4, 14);
}

function draw() {
  // Background (Grass)
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Road
  ctx.fillStyle = '#57606f';
  ctx.fillRect(50, 0, 300, canvas.height);

  // Road Borders
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(45, 0, 5, canvas.height);
  ctx.fillRect(350, 0, 5, canvas.height);

  // Lane Dividers (Dashed Animated Lines)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -roadOffset;

  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(150, canvas.height);
  ctx.moveTo(250, 0);
  ctx.lineTo(250, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Draw Traffic
  traffic.forEach(car => {
    drawCar(car.x, car.y, car.width, car.height, car.color);
  });

  // Draw Player Car
  drawCar(player.x, player.y, player.width, player.height, player.color);
}

function gameLoop() {
  update();
  draw();
  if (gameActive) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameActive = false;
  finalScoreEl.textContent = `Your Score: ${Math.floor(score / 10)}`;
  gameOverScreen.classList.remove('hidden');
}
