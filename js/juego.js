/* =========================================================================
   juego-jugar.js — "Base Out": mini block breaker con temática de béisbol
   -------------------------------------------------------------------------
   Construido en <canvas>, sin librerías externas. Se buscó una estética
   limpia y minimalista (nada de pixel art): pelota de béisbol vectorial,
   un bat como paleta, y un "tablero" de bloques con los colores de la marca.

   ¿QUIERES USAR UNA FOTO REAL DE LA PELOTA?
   Solo cambia BALL_IMAGE_SRC (línea de abajo) por la ruta de tu PNG —
   idealmente cuadrado, con fondo transparente, de unos 200x200px.
   Si el archivo no existe o no carga, el juego sigue funcionando y dibuja
   la pelota vectorial automáticamente: nunca se rompe nada.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Configuración editable ---------- */
  const BALL_IMAGE_SRC = null; // p.ej. "Images/pelota.png"
  const OUTS_MAX = 3;
  const ROWS_START = 4;
  const ROWS_MAX = 7;
  const ROW_COLORS = ["#e2231a", "#C9A227", "#1B2A5E", "#2E7D32", "#5B2A86", "#F58220", "#0D6EFD"];

  /* ---------- Elementos del DOM ---------- */
  const playArea = document.getElementById("gamePlayArea");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("gameOverlay");
  const hudScore = document.getElementById("hudScore");
  const hudLevel = document.getElementById("hudLevel");
  const outDots = [...document.querySelectorAll(".out-dot")];

  const instructionsModal = document.getElementById("gameInstructionsModal");
  const exitConfirmModal = document.getElementById("exitConfirmModal");

  const openModal = (el) => el.classList.add("is-open");
  const closeModal = (el) => el.classList.remove("is-open");
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /* ---------- Imagen opcional de la pelota ---------- */
  let ballImage = null;
  let ballImageReady = false;
  if (BALL_IMAGE_SRC) {
    ballImage = new Image();
    ballImage.onload = () => { ballImageReady = true; };
    ballImage.onerror = () => { ballImageReady = false; };
    ballImage.src = BALL_IMAGE_SRC;
  }

  /* ---------- Estado del juego ---------- */
  let WIDTH = 0, HEIGHT = 0, DPR = 1;
  let state = "ready"; // ready | playing | levelup | gameover
  let score = 0;
  let level = 1;
  let outsUsed = 0;
  let bricks = [];
  let bricksRemaining = 0;
  let paused = false;
  let hasStarted = false; // para saber si conviene confirmar antes de salir

  const paddle = { x: 0, y: 0, w: 100, h: 14, speed: 480 };
  const ball = { x: 0, y: 0, r: 10, vx: 0, vy: 0, baseSpeed: 300 };
  const keys = { left: false, right: false };
  let isDragging = false;

  /* ---------- Layout responsivo ---------- */
  function resize() {
    const prevW = WIDTH, prevH = HEIGHT;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    WIDTH = playArea.clientWidth;
    HEIGHT = playArea.clientHeight;
    if (!WIDTH || !HEIGHT) return;

    canvas.width = WIDTH * DPR;
    canvas.height = HEIGHT * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    paddle.w = clamp(WIDTH * 0.24, 70, 130);
    paddle.y = HEIGHT - 34;

    if (prevW && prevH) {
      const rx = WIDTH / prevW, ry = HEIGHT / prevH;
      paddle.x *= rx;
      ball.x *= rx; ball.y *= ry;
      ball.vx *= rx; ball.vy *= ry;
    } else {
      paddle.x = WIDTH / 2;
    }
    paddle.x = clamp(paddle.x, paddle.w / 2, WIDTH - paddle.w / 2);

    buildBricks();
    if (state === "ready") snapBallToPaddle();
  }

  /* ---------- Bloques ---------- */
  function buildBricks(preserveAlive = true) {
    const rows = Math.min(ROWS_START + (level - 1), ROWS_MAX);
    const isMobile = WIDTH <= 600;
    const cols = 6;
    const marginX = isMobile ? 8 : 14;
    const marginTop = 100;
    const gap = isMobile ? 4 : 7;
    const brickW = (WIDTH - marginX * 2 - gap * (cols - 1)) / cols;
    const brickH = 30;

    // Conserva qué bloques ya estaban destruidos (por ejemplo si el
    // teléfono rota y se recalcula el tablero con la misma cuadrícula).
    const alivePrev = {};
    if (preserveAlive) {
      bricks.forEach(b => { alivePrev[`${b.row}-${b.col}`] = b.alive; });
    }

    bricks = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${row}-${col}`;
        bricks.push({
          row, col,
          x: marginX + col * (brickW + gap),
          y: marginTop + row * (brickH + gap),
          w: brickW, h: brickH,
          color: ROW_COLORS[row % ROW_COLORS.length],
          points: (rows - row) * 10,
          alive: preserveAlive && key in alivePrev ? alivePrev[key] : true,
        });
      }
    }
    bricksRemaining = bricks.filter(b => b.alive).length;
  }

  /* ---------- Pelota / saque ---------- */
  function snapBallToPaddle() {
    ball.x = paddle.x;
    ball.y = paddle.y - paddle.h / 2 - ball.r - 1;
    ball.vx = 0; ball.vy = 0;
  }

  function launchBall() {
    if (state !== "ready") return;
    const speed = ball.baseSpeed * (1 + (level - 1) * 0.08);
    const angle = Math.random() * 0.5 - 0.25; // pequeña variación de salida
    ball.vx = speed * Math.sin(angle);
    ball.vy = -speed * Math.cos(angle);
    state = "playing";
    hasStarted = true;
    hideOverlay();
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    hudScore.textContent = String(score);
    hudLevel.textContent = String(level);
    outDots.forEach((dot, i) => dot.classList.toggle("is-used", i < outsUsed));
  }

  /* ---------- Overlays de estado ---------- */
  function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.hidden = false;
    const retryBtn = overlay.querySelector("[data-retry]");
    if (retryBtn) retryBtn.addEventListener("click", restartGame);
  }
  function hideOverlay() { overlay.hidden = true; }

  function readyOverlayHTML() {
    const msg = outsUsed > 0
      ? `Out ${outsUsed} de ${OUTS_MAX}. ¡Sigue bateando!`
      : "Toca la pantalla o presiona espacio para lanzar";
    return `<span class="tap-hint"></span><p>${msg}</p>`;
  }

  function loseBall() {
    outsUsed++;
    updateHud();
    if (outsUsed >= OUTS_MAX) {
      state = "gameover";
      showOverlay(`
        <h3>¡Juego terminado!</h3>
        <p>Marcador final: ${score}</p>
        <button class="btn-solid" data-retry>Volver a batear</button>
      `);
    } else {
      state = "ready";
      snapBallToPaddle();
      showOverlay(readyOverlayHTML());
    }
  }

  function clearLevel() {
    state = "levelup";
    showOverlay(`<h3>¡Entrada completa!</h3><p>Vas por ${score} puntos</p>`);
    setTimeout(() => {
      level++;
      buildBricks(false);
      state = "ready";
      snapBallToPaddle();
      updateHud();
      showOverlay(readyOverlayHTML());
    }, 1200);
  }

  function restartGame() {
    score = 0; level = 1; outsUsed = 0;
    buildBricks(false);
    state = "ready";
    snapBallToPaddle();
    updateHud();
    showOverlay(readyOverlayHTML());
  }

  /* ---------- Física ---------- */
  function update(dt) {
    if (keys.left) paddle.x -= paddle.speed * dt;
    if (keys.right) paddle.x += paddle.speed * dt;
    paddle.x = clamp(paddle.x, paddle.w / 2, WIDTH - paddle.w / 2);

    if (state !== "playing") {
      if (state === "ready") snapBallToPaddle();
      return;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
    if (ball.x + ball.r > WIDTH) { ball.x = WIDTH - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }

    // Colisión con el bat (paleta)
    const pTop = paddle.y - paddle.h / 2;
    if (ball.vy > 0 &&
        ball.y + ball.r >= pTop && ball.y + ball.r <= pTop + paddle.h + 8 &&
        ball.x + ball.r > paddle.x - paddle.w / 2 &&
        ball.x - ball.r < paddle.x + paddle.w / 2) {
      const rel = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1);
      const maxAngle = Math.PI / 3; // 60°
      const angle = rel * maxAngle;
      const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.02, ball.baseSpeed * 2.2);
      ball.vx = speed * Math.sin(angle);
      ball.vy = -Math.abs(speed * Math.cos(angle));
      ball.y = pTop - ball.r;
    }

    // Colisión con bloques (se resuelve solo una colisión por cuadro)
    for (const b of bricks) {
      if (!b.alive) continue;
      const overlapX = Math.min(ball.x + ball.r, b.x + b.w) - Math.max(ball.x - ball.r, b.x);
      const overlapY = Math.min(ball.y + ball.r, b.y + b.h) - Math.max(ball.y - ball.r, b.y);
      if (overlapX > 0 && overlapY > 0) {
        b.alive = false;
        bricksRemaining--;
        score += b.points;
        updateHud();
        if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
        break;
      }
    }

    if (ball.y - ball.r > HEIGHT) { loseBall(); return; }
    if (bricksRemaining <= 0) clearLevel();
  }

  /* ---------- Dibujo ---------- */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBricks() {
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fill();
      // línea sutil de sombra abajo, para dar profundidad plana/minimalista
      ctx.fillStyle = "rgba(0,0,0,.18)";
      roundRect(b.x, b.y + b.h - 4, b.w, 4, 4);
      ctx.fill();
    });
  }

  function drawPaddle() {
    const x = paddle.x - paddle.w / 2, y = paddle.y - paddle.h / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#f5f4f0";
    roundRect(x, y, paddle.w, paddle.h, paddle.h / 2);
    ctx.fill();
    ctx.restore();
    // marca central roja, como el "punto dulce" de un bat
    ctx.fillStyle = "#e2231a";
    roundRect(paddle.x - 3, y + 2, 6, paddle.h - 4, 3);
    ctx.fill();
  }

  function drawBallVector() {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    // "costuras" de la pelota de béisbol
    ctx.strokeStyle = "#c8102e";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r * 0.72, 0.35, Math.PI - 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r * 0.72, Math.PI + 0.35, Math.PI * 2 - 0.35);
    ctx.stroke();
  }

  function drawBall() {
    if (ballImageReady) {
      const d = ball.r * 2.1;
      ctx.drawImage(ballImage, ball.x - d / 2, ball.y - d / 2, d, d);
    } else {
      drawBallVector();
    }
  }

  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBricks();
    drawPaddle();
    drawBall();
  }

  /* ---------- Loop principal ---------- */
  let lastTime = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (paused || document.hidden || !WIDTH) { lastTime = now; return; }
    const dt = Math.min((now - lastTime) / 1000, 0.033) || 0;
    lastTime = now;
    update(dt);
    render();
  }

  /* ---------- Controles: arrastre / toque ---------- */
  function pointerToLocalX(clientX) {
    const rect = playArea.getBoundingClientRect();
    return clientX - rect.left;
  }

  playArea.addEventListener("pointerdown", (e) => {
    isDragging = true;
    paddle.x = clamp(pointerToLocalX(e.clientX), paddle.w / 2, WIDTH - paddle.w / 2);
    if (state === "ready") launchBall();
  });
  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    paddle.x = clamp(pointerToLocalX(e.clientX), paddle.w / 2, WIDTH - paddle.w / 2);
  });
  window.addEventListener("pointerup", () => { isDragging = false; });

  /* ---------- Controles: teclado ---------- */
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); launchBall(); }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
  });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) lastTime = performance.now();
  });

  /* ---------- Modal de instrucciones ---------- */
  document.getElementById("gameCanvasInfo").addEventListener("click", () => {
    paused = true;
    openModal(instructionsModal);
  });
  document.getElementById("gameInstructionsOk").addEventListener("click", () => {
    closeModal(instructionsModal);
    paused = false;
    lastTime = performance.now();
  });

  /* ---------- Confirmación de salida ---------- */
  document.getElementById("gameCanvasBack").addEventListener("click", (e) => {
    if (!hasStarted && score === 0) return; // nada que perder: deja navegar directo
    e.preventDefault();
    paused = true;
    openModal(exitConfirmModal);
  });
  document.getElementById("exitConfirmNo").addEventListener("click", () => {
    closeModal(exitConfirmModal);
    paused = false;
    lastTime = performance.now();
  });
  document.getElementById("exitConfirmYes").addEventListener("click", () => {
    window.location.href = "index.html#juego";
  });

  /* ---------- Arranque ---------- */
  resize();
  updateHud();
  showOverlay(readyOverlayHTML());
  requestAnimationFrame(loop);
});