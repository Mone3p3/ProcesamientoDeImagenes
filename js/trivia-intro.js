/* =========================================================================
   trivia-intro.js — Página de portada de la trivia
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("triviaInstructionsModal");

  function openModal() { modal.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }

  document.getElementById("triviaIntroInfo").addEventListener("click", openModal);
  document.getElementById("triviaInstructionsOk").addEventListener("click", closeModal);
});