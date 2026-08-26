/* =========================================================================
   juego-intro.js — Página de portada del juego
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("gameInstructionsModal");

  function openModal() { modal.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }

  document.getElementById("gameIntroInfo").addEventListener("click", openModal);
  document.getElementById("gameInstructionsOk").addEventListener("click", closeModal);
});