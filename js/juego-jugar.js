/* =========================================================================
   juego-jugar.js — Página del área de juego
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Modales ---------- */
  const instructionsModal = document.getElementById("gameInstructionsModal");
  const exitConfirmModal = document.getElementById("exitConfirmModal");

  function openModal(el) { el.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal(el) { el.classList.remove("is-open"); document.body.style.overflow = ""; }

  document.getElementById("gameCanvasInfo").addEventListener("click", () => openModal(instructionsModal));
  document.getElementById("gameInstructionsOk").addEventListener("click", () => closeModal(instructionsModal));

  // Al tocar "salir" durante el juego, se pide confirmación (sin guardar
  // progreso, porque todavía no hay progreso que guardar: el juego está
  // pendiente de programar).
  document.getElementById("gameCanvasBack").addEventListener("click", () => openModal(exitConfirmModal));
  document.getElementById("exitConfirmNo").addEventListener("click", () => closeModal(exitConfirmModal));
  document.getElementById("exitConfirmYes").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  /* ---------- Bloques visuales ---------- */
  // Dibuja las 5 filas de bloques de colores del "lienzo en blanco" del
  // juego (puramente visual — la lógica de destruirlos queda pendiente).
  const blockColors = ["#8a3fd1", "#2f8fd1", "#d1c22f", "#d1382f", "#d1792f"];
  const blockRows = document.getElementById("blockRows");
  blockColors.forEach(color => {
    for (let i = 0; i < 5; i++) {
      const block = document.createElement("div");
      block.className = "block";
      block.style.background = color;
      blockRows.appendChild(block);
    }
  });
});