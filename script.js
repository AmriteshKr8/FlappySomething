const player = document.getElementById("player");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");

let player_y = window.innerHeight / 2;
let velocity_y = 0;
let gravity = 0.5;
let jump_strength = 9;
let isGameRunning = false;
let isGameOver = false;
let currentScore = 0;
let pipes = [];
let pipe_gap = 170;
let pipe_speed = 3.5;
let pipeInterval;

let assets = {
  birdImg: null,
  pipeImg: null,
  bgm: null,
  jumpSound: null,
  dieSound: null,
};

document.getElementById("bird-upload").addEventListener("change", function (e) {
  if (e.target.files[0]) {
    assets.birdImg = URL.createObjectURL(e.target.files[0]);
    player.src = assets.birdImg;
    player.style.display = "block";
    player.style.backgroundColor = "transparent";
    player.style.border = "none";
  }
});

document.getElementById("pipe-upload").addEventListener("change", function (e) {
  if (e.target.files[0])
    assets.pipeImg = URL.createObjectURL(e.target.files[0]);
});

document.getElementById("bgm-upload").addEventListener("change", function (e) {
  if (e.target.files[0]) {
    assets.bgm = new Audio(URL.createObjectURL(e.target.files[0]));
    assets.bgm.loop = true;
    assets.bgm.volume = 0.5;
  }
});

document.getElementById("jump-upload").addEventListener("change", function (e) {
  if (e.target.files[0])
    assets.jumpSound = new Audio(URL.createObjectURL(e.target.files[0]));
});

document.getElementById("die-upload").addEventListener("change", function (e) {
  if (e.target.files[0])
    assets.dieSound = new Audio(URL.createObjectURL(e.target.files[0]));
});

function startGame() {
  startScreen.style.display = "none";
  player.style.display = "block";
  isGameRunning = true;

  if (assets.bgm)
    assets.bgm
      .play()
      .catch((e) => console.log("Audio play blocked until interaction"));

  requestAnimationFrame(update);
  pipeInterval = setInterval(createPipes, 2000);
}

function update() {
  if (!isGameRunning || isGameOver) return;
  velocity_y += gravity;
  if (velocity_y > 15) velocity_y = 15;
  player_y += velocity_y;
  if (player_y > window.innerHeight - 40) {
    player_y = window.innerHeight - 40;
    velocity_y = 0;
  }
  if (player_y < 0) {
    player_y = 0;
    velocity_y = 0;
  }
  let rotation = -20;
  if (velocity_y > 5) rotation = Math.min(90, velocity_y * 5);
  player.style.transform = `rotate(${rotation}deg)`;
  player.style.top = player_y + "px";
  moveAndCheckPipes();
  requestAnimationFrame(update);
}

function moveAndCheckPipes() {
  let birdRect = player.getBoundingClientRect();
  for (let i = pipes.length - 1; i >= 0; i--) {
    let pipe = pipes[i];
    pipe.x -= pipe_speed;
    pipe.top.style.left = pipe.x + "px";
    pipe.bottom.style.left = pipe.x + "px";
    let topRect = pipe.top.getBoundingClientRect();
    let bottomRect = pipe.bottom.getBoundingClientRect();

    if (
      checkCollision(birdRect, topRect) ||
      checkCollision(birdRect, bottomRect)
    ) {
      triggerGameOver();
    }
    if (pipe.x < -70) {
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);
      currentScore++;
      scoreDisplay.innerText = currentScore;
    }
  }
}

function checkCollision(rect1, rect2) {
  return (
    rect1.left + 5 < rect2.right &&
    rect1.right - 5 > rect2.left &&
    rect1.top + 5 < rect2.bottom &&
    rect1.bottom - 5 > rect2.top
  );
}

function triggerGameOver() {
  isGameOver = true;
  isGameRunning = false;
  clearInterval(pipeInterval);
  if (assets.bgm) assets.bgm.pause();
  if (assets.dieSound) assets.dieSound.play();
  finalScoreDisplay.innerText = currentScore;
  gameOverScreen.style.display = "block";
}

function createPipes() {
  if (!isGameRunning) return;
  let min_height = 50;
  let max_height = window.innerHeight - pipe_gap - min_height;
  let top_height = Math.floor(
    Math.random() * (max_height - min_height + 1) + min_height
  );
  let pipeTop = document.createElement("div");
  pipeTop.className = "pipe";
  pipeTop.style.top = "0px";
  pipeTop.style.height = top_height + "px";
  pipeTop.style.left = window.innerWidth + "px";
  let pipeBottom = document.createElement("div");
  pipeBottom.className = "pipe";
  pipeBottom.style.bottom = "0px";
  pipeBottom.style.height = window.innerHeight - top_height - pipe_gap + "px";
  pipeBottom.style.left = window.innerWidth + "px";
  if (assets.pipeImg) {
    pipeTop.style.backgroundImage = `url(${assets.pipeImg})`;
    pipeBottom.style.backgroundImage = `url(${assets.pipeImg})`;
    pipeTop.style.backgroundColor = "transparent";
    pipeBottom.style.backgroundColor = "transparent";
    pipeTop.style.border = "none";
    pipeBottom.style.border = "none";
  }
  document.body.appendChild(pipeTop);
  document.body.appendChild(pipeBottom);
  pipes.push({ x: window.innerWidth, top: pipeTop, bottom: pipeBottom });
}
function jump() {
  if (isGameRunning && !isGameOver) {
    velocity_y = -jump_strength;
    if (assets.jumpSound) {
      assets.jumpSound.currentTime = 0;
      assets.jumpSound.play();
    }
  }
}
document.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
    jump();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
