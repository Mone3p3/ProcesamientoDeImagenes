/* =========================================================================
   ar-escaner.js — Página del escáner AR
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("arInstructionsModal");

  function openModal() { modal.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("is-open"); document.body.style.overflow = ""; }

  document.getElementById("scannerInfo").addEventListener("click", openModal);
  document.getElementById("arInstructionsOk").addEventListener("click", closeModal);
});