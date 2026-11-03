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
    piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
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

  const btnParticulas = document.getElementById("btnParticulas");
  if (btnParticulas) {
    btnParticulas.addEventListener("click", () => {
      if (confettiLayer) stopConfetti();
      else startConfetti(5000);
    });
  }

  const btnAnimar = document.getElementById("btnAnimar");
  const btnEquipo = document.getElementById("btnEquipo");
  let currentModel = null;
  let isPlaying = false;

  const EQUIPOS = {
    braves: "atlanta-braves",
    brewers: "milwaukee-brewers",
    cardinals: "st-louis-cardinals",
    cin: "cincinnati-reds",
    cubs: "chicago-cubs",
    diamond: "arizona-diamondbacks",
    dodgers: "los-angeles-dodgers",
    giants: "san-francisco-giants",
    mets: "new-york-mets",
    miami: "miami-marlins",
    nationals: "washington-nationals",
    padres: "san-diego-padres",
    phillies: "philadelphia-phillies",
    pirates: "pittsburgh-pirates",
    rockies: "colorado-rockies",
  };

  function mostrarEquipo(modelo) {
    let id = null;
    if (modelo) {
      const pistas = [modelo.getAttribute("gltf-model"), modelo.getAttribute("src"), modelo.id]
        .join(" ").toLowerCase();
      const clave = Object.keys(EQUIPOS).find((k) => pistas.includes(k));
      id = clave ? EQUIPOS[clave] : null;
      if (!id) console.warn("No se pudo identificar el equipo del modelo:", pistas);
    }
    btnEquipo.style.display = id ? "" : "none";
    if (id) btnEquipo.href = `detalle.html?tipo=team&id=${id}`;
  }

  document.addEventListener("modelo-visible", (e) => {
    currentModel = e.detail.modelo3D;
    isPlaying = true;
    currentModel.setAttribute("animation-mixer", "clip: *; loop: repeat; timeScale: 1");
    mostrarEquipo(currentModel);
  });

  document.addEventListener("modelo-oculto", (e) => {
    if (currentModel === e.detail.modelo3D) currentModel = null;
    setTimeout(() => {
      if (!currentModel) btnEquipo.style.display = "none";
    }, 1500);
  });

  if (btnAnimar) {
    btnAnimar.addEventListener("click", () => {
      if (!currentModel) return;
      isPlaying = !isPlaying;
      currentModel.setAttribute("animation-mixer", `clip: *; loop: repeat; timeScale: ${isPlaying ? 1 : 0}`);
    });
  }

  const btnFoto = document.getElementById("btnFoto");
  const btnVideo = document.getElementById("btnVideo");
  const sceneEl = document.querySelector("a-scene");
  const cameraCanvas = document.querySelector(".camera-canvas");

  const escenaLista = () => sceneEl.renderer && sceneEl.canvas;

  function nuevoCanvas() {
    const rect = cameraCanvas.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(rect.width / 2) * 2;
    canvas.height = Math.floor(rect.height / 2) * 2;
    return { canvas, ctx: canvas.getContext("2d") };
  }

  function dibujarFrame(ctx, w, h) {
    const rect = cameraCanvas.getBoundingClientRect();
    const video = cameraCanvas.querySelector("video") || document.querySelector("video");

    if (video && video.readyState >= 2) {
      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
      if (videoRatio > canvasRatio) {
        sw = sh * canvasRatio;
        sx = (video.videoWidth - sw) / 2;
      } else {
        sh = sw / canvasRatio;
        sy = (video.videoHeight - sh) / 2;
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
    }

    sceneEl.renderer.render(sceneEl.object3D, sceneEl.camera);
    ctx.drawImage(sceneEl.canvas, 0, 0, w, h);

    document.querySelectorAll(".confetti-piece").forEach((piece) => {
      const p = piece.getBoundingClientRect();
      const x = p.left - rect.left;
      const y = p.top - rect.top;
      ctx.fillStyle = getComputedStyle(piece).backgroundColor;
      if (piece.style.borderRadius === "50%") {
        ctx.beginPath();
        ctx.arc(x + p.width / 2, y + p.height / 2, Math.min(p.width, p.height) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, p.width, p.height);
      }
    });
  }

  if (btnFoto) {
    btnFoto.addEventListener("click", () => {
      if (!escenaLista()) return;

      const { canvas, ctx } = nuevoCanvas();
      dibujarFrame(ctx, canvas.width, canvas.height);

      btnFoto.disabled = true;
      canvas.toBlob(async (blob) => {
        try {
          if (!blob) throw new Error("No se pudo generar la imagen");
          await TocarBaseGaleria.add(blob, `Foto AR ${new Date().toLocaleString("es-MX")}`);
          showToast("¡Foto guardada en la galería!");
        } catch (err) {
          console.error(err);
          showToast("No se pudo guardar la foto.");
        } finally {
          btnFoto.disabled = false;
        }
      }, "image/jpeg", 0.92);
    });
  }

  if (btnVideo) {
    const DURACION = 5000;
    const FORMATOS = ["video/mp4", "video/webm;codecs=vp9", "video/webm"];

    btnVideo.addEventListener("click", () => {
      if (!escenaLista() || !window.MediaRecorder) {
        showToast("Tu navegador no puede grabar video.");
        return;
      }

      const { canvas, ctx } = nuevoCanvas();
      const formato = FORMATOS.find((f) => MediaRecorder.isTypeSupported(f));
      const rec = new MediaRecorder(canvas.captureStream(30), formato ? { mimeType: formato } : {});
      const partes = [];
      let grabando = true;

      rec.ondataavailable = (e) => { if (e.data.size) partes.push(e.data); };
      rec.onstop = async () => {
        try {
          const blob = new Blob(partes, { type: rec.mimeType || formato });
          await TocarBaseGaleria.addVideo(blob, `Video AR ${new Date().toLocaleString("es-MX")}`);
          showToast("¡Video guardado en la galería!");
        } catch (err) {
          console.error(err);
          showToast("No se pudo guardar el video.");
        } finally {
          btnVideo.disabled = false;
          btnVideo.classList.remove("is-recording");
        }
      };

      const pintar = () => {
        if (!grabando) return;
        dibujarFrame(ctx, canvas.width, canvas.height);
        requestAnimationFrame(pintar);
      };

      btnVideo.disabled = true;
      btnVideo.classList.add("is-recording");
      showToast("Grabando 5 segundos…");
      rec.start();
      pintar();
      setTimeout(() => { grabando = false; rec.stop(); }, DURACION);
    });
  }

  function showToast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.setAttribute("role", "status");
    t.style.cssText =
      "position:fixed;left:50%;bottom:calc(110px + env(safe-area-inset-bottom,0px));" +
      "transform:translateX(-50%);background:rgba(10,10,10,.9);color:#fff;" +
      "padding:10px 18px;border-radius:999px;font:600 14px Barlow,sans-serif;" +
      "z-index:9999;pointer-events:none;transition:opacity .4s;";
    document.body.appendChild(t);
    setTimeout(() => (t.style.opacity = "0"), 1800);
    setTimeout(() => t.remove(), 2300);
  }
});