/* =========================================================================
   ar-modelo-particulas.js — Confeti al picar el botón, lluvia por 5s
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {

  const colors = ["#e2231a", "#C9A227", "#1B2A5E", "#2E7D32", "#F58220", "#ffffff"];

  let confettiLayer = null;
  let spawnInterval = null;
  let stopTimeout = null;
  let cleanupTimeout = null;

  function createPiece(layer) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const fallDuration = 2.5 + Math.random() * 1.5;
    piece.style.animationDuration = `${fallDuration}s`;
    layer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }

  function startConfetti(duration = 5000) {
    if (confettiLayer) return;

    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);
    confettiLayer = layer;

    spawnInterval = setInterval(() => {
      for (let i = 0; i < 6; i++) createPiece(layer);
    }, 150);

    stopTimeout = setTimeout(() => {
      clearInterval(spawnInterval);
      spawnInterval = null;
    }, duration);

    cleanupTimeout = setTimeout(() => {
      if (confettiLayer) {
        confettiLayer.remove();
        confettiLayer = null;
      }
    }, duration + 4000);
  }

  function stopConfetti() {
    clearInterval(spawnInterval);
    clearTimeout(stopTimeout);
    clearTimeout(cleanupTimeout);
    spawnInterval = null;
    if (confettiLayer) {
      confettiLayer.remove();
      confettiLayer = null;
    }
  }

  // --- Conectado al botón ---
  const btnParticulas = document.getElementById("btnParticulas");

  if (!btnParticulas) {
    console.warn("⚠️ No se encontró #btnParticulas en el HTML. Revisa que el id esté escrito exactamente así en el botón.");
  } else {
    btnParticulas.addEventListener("click", () => {
      if (confettiLayer) {
        stopConfetti();
      } else {
        startConfetti(5000);
      }
    });
  }



  
// -----------------------------------------------------------------------
  // 2. BLOQUE: Animación 3D (A-Frame / AR.js)
  // -----------------------------------------------------------------------
  const btnAnimar = document.getElementById("btnAnimar");
  let currentModel = null;
  let isPlaying = false;

  document.addEventListener("modelo-visible", (e) => {
    currentModel = e.detail.modelo3D;
    isPlaying = false;
  });

  document.addEventListener("modelo-oculto", (e) => {
    if (currentModel === e.detail.modelo3D) currentModel = null;
  });

  if (!btnAnimar) {
    console.warn("⚠️ No se encontró #btnAnimar en el HTML.");
  } else {
    btnAnimar.addEventListener("click", () => {
      if (!currentModel) return;

      isPlaying = !isPlaying;
      const timeScale = isPlaying ? 1 : 0;
      currentModel.setAttribute('animation-mixer', `clip: *; loop: repeat; timeScale: ${timeScale}`);
    });
  }


  /* =======================================================================
     TOMAR FOTO (compone cámara + modelo + confeti)
     ======================================================================= */
  const btnFoto = document.getElementById("btnFoto");
  const sceneEl = document.querySelector("a-scene");
  const cameraCanvas = document.querySelector(".camera-canvas");

  if (!btnFoto) {
    console.warn("⚠️ No se encontró #btnFoto en el HTML.");
  } else {

    const findVideo = () =>
      cameraCanvas.querySelector("video") || document.querySelector("video");

    btnFoto.addEventListener("click", () => {
      if (!sceneEl.renderer || !sceneEl.canvas) {
        console.warn("⚠️ La escena AR todavía no está lista.");
        return;
      }

      const video = findVideo();
      const rect = cameraCanvas.getBoundingClientRect();

      const outCanvas = document.createElement("canvas");
      outCanvas.width = rect.width;
      outCanvas.height = rect.height;
      const ctx = outCanvas.getContext("2d");

      // 1) Fondo: el video en vivo de la cámara.
      if (video && video.readyState >= 2) {
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = outCanvas.width / outCanvas.height;
        let sx, sy, sw, sh;
        if (videoRatio > canvasRatio) {
          sh = video.videoHeight; sw = sh * canvasRatio;
          sx = (video.videoWidth - sw) / 2; sy = 0;
        } else {
          sw = video.videoWidth; sh = sw / canvasRatio;
          sx = 0; sy = (video.videoHeight - sh) / 2;
        }
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outCanvas.width, outCanvas.height);
      } else {
        console.warn("⚠️ No se encontró el video de la cámara; la foto saldrá sin ese fondo.");
      }

      // 2) El modelo 3D: forzamos un render fresco justo antes de copiarlo.
      sceneEl.renderer.render(sceneEl.object3D, sceneEl.camera);
      ctx.drawImage(sceneEl.canvas, 0, 0, outCanvas.width, outCanvas.height);

      // 3) El confeti activo en este momento (son <div>, no WebGL).
      document.querySelectorAll(".confetti-piece").forEach((piece) => {
        const pieceRect = piece.getBoundingClientRect();
        ctx.fillStyle = getComputedStyle(piece).backgroundColor;
        const x = pieceRect.left - rect.left;
        const y = pieceRect.top - rect.top;
        if (piece.style.borderRadius === "50%") {
          const radius = Math.min(pieceRect.width, pieceRect.height) / 2;
          ctx.beginPath();
          ctx.arc(x + pieceRect.width / 2, y + pieceRect.height / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, pieceRect.width, pieceRect.height);
        }
      });

      // 4) Descarga la imagen final.
      const link = document.createElement("a");
      link.download = `tocar-base-ar-${Date.now()}.png`;
      link.href = outCanvas.toDataURL("image/png");
      link.click();
    });
  }
  
});