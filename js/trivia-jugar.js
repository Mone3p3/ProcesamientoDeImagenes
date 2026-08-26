/* =========================================================================
   trivia-jugar.js — Página de pregunta de trivia (verdadero / falso)
   -------------------------------------------------------------------------
   Usa el arreglo TRIVIA de data.js. Cuando conectes la base de datos,
   sustitúyelo por preguntas obtenidas de tu API.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Modales ---------- */
  const instructionsModal = document.getElementById("triviaInstructionsModal");
  const exitConfirmModal = document.getElementById("exitConfirmModal");

  function openModal(el) { el.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal(el) { el.classList.remove("is-open"); document.body.style.overflow = ""; }

  document.getElementById("triviaInfo").addEventListener("click", () => openModal(instructionsModal));
  document.getElementById("triviaInstructionsOk").addEventListener("click", () => closeModal(instructionsModal));

  // Al tocar "salir" durante la trivia, se pide confirmación (igual que en
  // el juego): el progreso de la trivia no se guarda.
  document.getElementById("triviaBack").addEventListener("click", () => openModal(exitConfirmModal));
  document.getElementById("exitConfirmNo").addEventListener("click", () => closeModal(exitConfirmModal));
  document.getElementById("exitConfirmYes").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  /* ---------- Lógica de la pregunta ---------- */
  const counterEl = document.getElementById("triviaCounter");
  const questionEl = document.getElementById("triviaQuestion");
  const feedbackEl = document.getElementById("triviaFeedback");
  const btnTrue = document.getElementById("triviaTrue");
  const btnFalse = document.getElementById("triviaFalse");
  const btnNext = document.getElementById("triviaNext");

  let currentIndex = 0;

  function loadQuestion(idx) {
    const pregunta = TRIVIA[idx];
    counterEl.textContent = `Pregunta ${idx + 1} de ${TRIVIA.length}`;
    questionEl.textContent = pregunta.pregunta;
    feedbackEl.textContent = "";
    [btnTrue, btnFalse].forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("is-correct", "is-incorrect");
    });
    btnNext.hidden = true;
  }

  function answer(valorElegido) {
    const pregunta = TRIVIA[currentIndex];
    const acerto = valorElegido === pregunta.respuesta;
    const btnElegido = valorElegido ? btnTrue : btnFalse;
    const btnCorrecto = pregunta.respuesta ? btnTrue : btnFalse;

    btnElegido.classList.add(acerto ? "is-correct" : "is-incorrect");
    if (!acerto) btnCorrecto.classList.add("is-correct");

    btnTrue.disabled = true;
    btnFalse.disabled = true;

    feedbackEl.textContent = acerto
      ? "¡Correcto!"
      : `Incorrecto. La respuesta correcta era "${pregunta.respuesta ? "Verdadero" : "Falso"}".`;

    btnNext.hidden = false;
  }

  btnTrue.addEventListener("click", () => answer(true));
  btnFalse.addEventListener("click", () => answer(false));

  btnNext.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % TRIVIA.length;
    loadQuestion(currentIndex);
  });

  loadQuestion(currentIndex);
});