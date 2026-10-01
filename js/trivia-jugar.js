/* =========================================================================
   trivia-jugar.js — Trivia: arrastra y lanza la pelota.
   Derecha = Verdadero, izquierda = Falso. 5 preguntas + calificación final.
   Usa el arreglo TRIVIA de data.js.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {

  const TOTAL = 5;
  const THRESHOLD = 70;      // px arrastrados para contar como lanzamiento
  const MIN_SPEED = 0.5;     // px/ms: un "flick" rápido también cuenta
  const NEXT_DELAY = 1100;   // ms que se ve el resultado de cada pregunta

  /* ---------- Modal de instrucciones ---------- */
  const modal = document.getElementById("triviaInstructionsModal");
  const openModal = () => { modal.classList.add("is-open"); document.body.style.overflow = "hidden"; };
  const closeModal = () => { modal.classList.remove("is-open"); document.body.style.overflow = ""; };
  document.getElementById("triviaInfo").addEventListener("click", openModal);
  document.getElementById("triviaInstructionsOk").addEventListener("click", closeModal);

  /* ---------- Elementos ---------- */
  const gameEl = document.getElementById("triviaGame");
  const resultEl = document.getElementById("triviaResult");
  const counterEl = document.getElementById("triviaCounter");
  const progressEl = document.getElementById("triviaProgress");
  const card = document.getElementById("swipeCard");
  const questionEl = document.getElementById("triviaQuestion");
  const feedbackEl = document.getElementById("triviaFeedback");
  const ball = document.getElementById("throwBall");
  const stampTrue = card.querySelector(".stamp-true");
  const stampFalse = card.querySelector(".stamp-false");

  /* ---------- Estado ---------- */
  let questions = [], index = 0, score = 0, results = [], locked = false;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function renderDots(container) {
    container.innerHTML = "";
    questions.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "dot";
      if (results[i] === true) d.classList.add("ok");
      else if (results[i] === false) d.classList.add("bad");
      else if (i === index && container === progressEl) d.classList.add("is-current");
      container.appendChild(d);
    });
  }

  /* ---------- Flujo ---------- */
  function startGame() {
    questions = shuffle(TRIVIA).slice(0, TOTAL);
    index = 0; score = 0; results = [];
    resultEl.hidden = true;
    gameEl.hidden = false;
    loadQuestion();
  }

  function loadQuestion() {
    const q = questions[index];
    counterEl.textContent = `Pregunta ${index + 1} de ${questions.length}`;
    questionEl.textContent = q.pregunta;
    feedbackEl.textContent = "";
    feedbackEl.className = "trivia-feedback";
    renderDots(progressEl);

    // Tarjeta nueva
    resetFeel();
    card.style.transform = "";
    card.classList.remove("is-leaving");
    card.classList.add("is-entering");
    card.addEventListener("animationend", () => card.classList.remove("is-entering"), { once: true });

    // Pelota nueva
    ball.classList.remove("is-thrown", "is-snapping");
    ball.style.transform = "";
    ball.classList.add("is-entering");
    ball.addEventListener("animationend", () => ball.classList.remove("is-entering"), { once: true });

    locked = false;
  }

  // La tarjeta reacciona a hacia dónde se está llevando la pelota
  function setFeel(dx) {
    const p = Math.min(Math.abs(dx) / THRESHOLD, 1);
    const color = dx > 0 ? "61,220,113" : "255,92,92";
    card.style.setProperty("--tint", `rgba(${color}, ${p * 0.28})`);
    stampTrue.style.opacity = dx > 0 ? p : 0;
    stampFalse.style.opacity = dx < 0 ? p : 0;
  }
  function resetFeel() {
    card.style.setProperty("--tint", "transparent");
    stampTrue.style.opacity = 0;
    stampFalse.style.opacity = 0;
  }

  function answer(valorElegido, dy = 0) {
    if (locked) return;
    locked = true;

    const q = questions[index];
    const acerto = valorElegido === q.respuesta;
    if (acerto) score++;
    results[index] = acerto;
    const dir = valorElegido ? 1 : -1;

    // La pelota sale volando
    ball.classList.remove("is-snapping");
    ball.classList.add("is-thrown");
    ball.style.transform = `translate(${dir * window.innerWidth * 0.7}px, ${dy - 140}px) rotate(${dir * 900}deg) scale(.5)`;

    // La tarjeta se va hacia el mismo lado
    setFeel(dir * THRESHOLD);
    card.classList.add("is-leaving");
    card.style.transform = `translateX(${dir * 420}px) rotate(${dir * 22}deg)`;

    feedbackEl.classList.add(acerto ? "ok" : "bad");
    feedbackEl.textContent = acerto
      ? "¡Correcto!"
      : `Incorrecto. La respuesta era "${q.respuesta ? "Verdadero" : "Falso"}".`;
    renderDots(progressEl);

    setTimeout(() => {
      index++;
      if (index < questions.length) loadQuestion();
      else showResult();
    }, NEXT_DELAY);
  }

  function showResult() {
    gameEl.hidden = true;
    resultEl.hidden = false;
    document.getElementById("resultScore").textContent = score;
    renderDots(document.getElementById("resultDots"));

    let title, msg;
    if (score === questions.length) { title = "¡Cuadrangular!"; msg = "Respondiste todo bien. Eres un experto de la LMB."; }
    else if (score >= 4)            { title = "¡Gran juego!"; msg = "Casi perfecto. Te faltó muy poco."; }
    else if (score >= 3)            { title = "Buen turno al bat"; msg = "Vas bien. Repasa los equipos y estadios y vuelve a intentarlo."; }
    else if (score >= 1)            { title = "Sigue practicando"; msg = "Explora la app y regresa por la revancha."; }
    else                            { title = "Ponchado"; msg = "Esta vez no hubo suerte. ¡Intenta de nuevo!"; }
    document.getElementById("resultTitle").textContent = title;
    document.getElementById("resultMsg").textContent = msg;
  }

  /* ---------- Arrastrar y lanzar la pelota ---------- */
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, samples = [];

  ball.addEventListener("pointerdown", (e) => {
    if (locked) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    dx = 0; dy = 0;
    samples = [{ t: performance.now(), x: e.clientX }];
    ball.setPointerCapture(e.pointerId);
    ball.classList.remove("is-snapping", "is-entering");
  });

  ball.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    const now = performance.now();
    samples.push({ t: now, x: e.clientX });
    samples = samples.filter(s => now - s.t < 100);   // solo los últimos 100 ms

    ball.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 1.2}deg)`;
    setFeel(dx);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;

    // Velocidad horizontal al soltar (px/ms)
    const first = samples[0], last = samples[samples.length - 1];
    const vx = last && first && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;

    let dir = 0;
    if (Math.abs(dx) >= THRESHOLD) dir = Math.sign(dx);
    else if (Math.abs(vx) >= MIN_SPEED && Math.abs(dx) > 15) dir = Math.sign(vx);

    if (dir !== 0) {
      answer(dir > 0, dy);
    } else {
      ball.classList.add("is-snapping");
      ball.style.transform = "";
      resetFeel();
    }
  }
  ball.addEventListener("pointerup", endDrag);
  ball.addEventListener("pointercancel", endDrag);

  /* ---------- Teclado (accesibilidad): flechas ← / → ---------- */
  document.addEventListener("keydown", (e) => {
    if (!resultEl.hidden || modal.classList.contains("is-open")) return;
    if (e.key === "ArrowRight") answer(true);
    if (e.key === "ArrowLeft") answer(false);
  });

  document.getElementById("triviaRetry").addEventListener("click", startGame);

  startGame();
});
