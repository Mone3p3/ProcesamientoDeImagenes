document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("galleryGrid");
  const emptyMsg = document.getElementById("galleryEmpty");
  const statusEl = document.getElementById("galleryStatus");
  const btnBorrarTodo = document.getElementById("btnBorrarTodo");
  if (!grid || !window.TocarBaseGaleria) return;

  const DB = window.TocarBaseGaleria;
  const R = window.TocarBaseRecompensas;

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    clearTimeout(setStatus.t);
    if (msg) setStatus.t = setTimeout(() => (statusEl.textContent = ""), 3500);
  }
  function loadImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
      img.src = url;
    });
  }

  const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  let urls = [];
  let renderSeq = 0;

  async function renderGallery() {
    const mySeq = ++renderSeq;

    let fotos = [];
    try { fotos = (await DB.getAll()).sort((a, b) => b.fecha - a.fecha); }
    catch { setStatus("Tu navegador no permite guardar fotos aquí."); }

    if (mySeq !== renderSeq) return;

    const newUrls = [];
    const frag = document.createDocumentFragment();

    fotos.forEach(foto => {
      const url = URL.createObjectURL(foto.blob);
      newUrls.push(url);
      const tile = document.createElement("div");
      tile.className = "gallery-tile";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", `Editar ${foto.nombre}`);
      if (foto.tipo === "video") {
        const vid = document.createElement("video");
        vid.src = `${url}#t=0.1`;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = "metadata";
        tile.appendChild(vid);
        tile.insertAdjacentHTML("beforeend", PLAY_ICON);
      } else {
        const img = document.createElement("img");
        img.src = url;
        img.alt = foto.nombre;
        tile.appendChild(img);
      }
      const open = () => openEditor(foto);
      tile.addEventListener("click", open);
      tile.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      frag.appendChild(tile);
    });

    urls.forEach(u => URL.revokeObjectURL(u));
    urls = newUrls;
    grid.replaceChildren(frag);

    emptyMsg.hidden = fotos.length > 0;
    if (btnBorrarTodo) btnBorrarTodo.hidden = fotos.length === 0;
  }

  if (btnBorrarTodo) {
    btnBorrarTodo.addEventListener("click", async () => {
      if (!confirm("¿Borrar TODAS las fotos de la galería? Esta acción no se puede deshacer.")) return;
      await DB.clear();
      setStatus("Galería vaciada.");
      renderGallery();
    });
  }

  const btnSubir = document.getElementById("btnSubir");
  const inputSubir = document.getElementById("inputSubir");
  const MAX_VIDEO_MB = 60;

  if (btnSubir && inputSubir) {
    btnSubir.addEventListener("click", () => inputSubir.click());

    inputSubir.addEventListener("change", async () => {
      let guardados = 0;
      let fallidos = 0;

      for (const archivo of inputSubir.files) {
        try {
          if (archivo.type.startsWith("image/")) {
            await DB.add(archivo, archivo.name);
          } else if (archivo.type.startsWith("video/") && archivo.size <= MAX_VIDEO_MB * 1024 * 1024) {
            await DB.addVideo(archivo, archivo.name);
          } else {
            throw new Error("Archivo no permitido");
          }
          guardados++;
        } catch (err) {
          console.warn("No se pudo subir", archivo.name, err);
          fallidos++;
        }
      }

      inputSubir.value = "";
      setStatus(fallidos === 0
        ? (guardados === 1 ? "Archivo agregado a la galería." : `${guardados} archivos agregados a la galería.`)
        : `${guardados} agregados, ${fallidos} no se pudieron subir (revisa el formato o que el video pese menos de ${MAX_VIDEO_MB} MB).`);
      renderGallery();
    });
  }

  const overlay = document.createElement("div");
  overlay.className = "editor-overlay";
  overlay.innerHTML = `
    <div class="editor-card">
      <div class="editor-head">
        <h3 id="edTitle">Editar foto</h3>
        <button class="circle-btn" id="edClose" aria-label="Cerrar editor">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="editor-canvas-wrap"><canvas id="edCanvas"></canvas></div>
      <div class="editor-canvas-wrap" id="edVideoWrap" style="display:none"><div class="video-box"><video id="edVideo" loop muted playsinline></video><img class="video-sticker" id="edVideoSticker" alt="" style="display:none"></div></div>
      <div class="fx-list">
        <div class="fx-row" data-solo-foto><label for="fxThermal">Térmico <output></output></label>
          <input type="range" class="form-range" id="fxThermal" min="0" max="100" value="0"></div>
        <div class="fx-row" data-solo-foto><label for="fxPixel">Pixeleado <output></output></label>
          <input type="range" class="form-range" id="fxPixel" min="0" max="100" value="0"></div>
        <div class="fx-row"><label for="fxBlur">Desenfoque <output></output></label>
          <input type="range" class="form-range" id="fxBlur" min="0" max="100" value="0"></div>
        <div class="fx-row"><label for="fxSat">Saturación <output></output></label>
          <input type="range" class="form-range" id="fxSat" min="0" max="200" value="100"></div>
      </div>
      <div class="fx-sticker" id="fxSticker"></div>
      <div class="editor-actions">
        <button class="btn-ghost" id="edReset">Restablecer</button>
        <button class="btn-solid" id="edDownload">Descargar</button>
      </div>
      <div class="editor-actions editor-actions-2">
        <button class="btn-ghost" id="edSaveCopy">Guardar copia en galería</button>
        <button class="btn-ghost btn-danger" id="edDelete">Eliminar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const stickerCss = document.createElement("style");
  stickerCss.textContent = `
    .fx-sticker{margin:14px 0 4px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)}
    .fx-sticker-title{font-weight:700;font-size:.95rem;margin:0 0 8px;display:flex;align-items:center;gap:8px}
    .fx-badge{font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;background:#C9A227;color:#111;border-radius:999px;padding:2px 8px}
    .fx-locked{margin:0;font-size:.85rem;opacity:.7}
    .sticker-row{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 10px;-webkit-overflow-scrolling:touch}
    .sticker-btn{flex:0 0 auto;min-width:48px;height:48px;border-radius:12px;border:2px solid rgba(255,255,255,.18);
      background:rgba(255,255,255,.06);color:inherit;display:grid;place-items:center;padding:4px 8px;font-size:.75rem;cursor:pointer}
    .sticker-btn img{width:36px;height:36px;object-fit:contain;pointer-events:none}
    .sticker-btn.is-active,.sticker-pos button.is-active{border-color:#C9A227;background:rgba(201,162,39,.18)}
    .sticker-pos{display:flex;gap:8px;margin-top:6px}
    .sticker-pos button{flex:1;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;cursor:pointer}
  `;
  document.head.appendChild(stickerCss);

  const canvas = overlay.querySelector("#edCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const sliders = {
    thermal: overlay.querySelector("#fxThermal"),
    pixel: overlay.querySelector("#fxPixel"),
    blur: overlay.querySelector("#fxBlur"),
    sat: overlay.querySelector("#fxSat"),
  };
  const DEFAULTS = { thermal: 0, pixel: 0, blur: 0, sat: 100 };
  const hasCtxFilter = "filter" in ctx;
  let srcImg = null, activeFoto = null, raf = 0;

  const canvasWrap = canvas.parentElement;
  const edVideoWrap = overlay.querySelector("#edVideoWrap");
  const edVideo = overlay.querySelector("#edVideo");
  const edVideoSticker = overlay.querySelector("#edVideoSticker");
  const soloFoto = overlay.querySelectorAll("[data-solo-foto]");
  let videoUrl = null;
  const esVideo = () => activeFoto && activeFoto.tipo === "video";

  const radioBlur = (ancho) => (+sliders.blur.value / 100) * 20 * (ancho / 1080);
  const filtroCss = (ancho) => `blur(${radioBlur(ancho).toFixed(1)}px) saturate(${sliders.sat.value}%)`;

  edVideo.addEventListener("click", () => (edVideo.paused ? edVideo.play() : edVideo.pause()));

  const stickerBox = overlay.querySelector("#fxSticker");
  const sticker = { img: null, src: null, size: 25, pos: "br" };
  const imgCache = {};
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const STICKERS_MANUAL = [];

  function getStickers() {
    if (STICKERS_MANUAL.length) return STICKERS_MANUAL;
    let lista = null;
    if (typeof EQUIPOS !== "undefined") lista = EQUIPOS;
    else if (typeof TEAMS !== "undefined") lista = TEAMS;
    else if (typeof equipos !== "undefined") lista = equipos;
    else if (typeof teams !== "undefined") lista = teams;
    if (!Array.isArray(lista)) return [];
    return lista
      .map(t => ({
        nombre: t.nombre || t.name || t.equipo || "Equipo",
        src: t.escudo || t.logo || t.icono || t.imagen || t.img || t.shield || t.src,
      }))
      .filter(s => s.src);
  }

  function calcSticker(w, h, im) {
    const ratio = (im.naturalWidth || 1) / (im.naturalHeight || 1);
    const box = Math.min(w, h) * (sticker.size / 100);
    const sw = ratio >= 1 ? box : box * ratio;
    const sh = ratio >= 1 ? box / ratio : box;
    const m = Math.min(w, h) * 0.09;
    return {
      box, sw, sh,
      x: sticker.pos.endsWith("l") ? m : w - sw - m,
      y: sticker.pos.startsWith("t") ? m : h - sh - m,
    };
  }

  function dibujarSticker(cx, w, h) {
    if (!sticker.img) return;
    const { box, sw, sh, x, y } = calcSticker(w, h, sticker.img);
    cx.save();
    cx.shadowColor = "rgba(0,0,0,.45)";
    cx.shadowBlur = box * 0.08;
    cx.drawImage(sticker.img, x, y, sw, sh);
    cx.restore();
  }

  function actualizarStickerVideo(w, h) {
    if (!sticker.img || !w || !h) {
      edVideoSticker.style.display = "none";
      return;
    }
    const { sw, sh, x, y } = calcSticker(w, h, sticker.img);
    edVideoSticker.src = sticker.img.src;
    Object.assign(edVideoSticker.style, {
      display: "block",
      left: `${x}px`,
      top: `${y}px`,
      width: `${sw}px`,
      height: `${sh}px`,
    });
  }

  function loadSticker(src) {
    sticker.src = src;
    if (!src) { sticker.img = null; scheduleDraw(); return; }
    if (imgCache[src]) { sticker.img = imgCache[src]; scheduleDraw(); return; }
    const im = new Image();
    im.onload = () => {
      imgCache[src] = im;
      if (sticker.src === src) { sticker.img = im; scheduleDraw(); }
    };
    im.onerror = () => setStatus("No se pudo cargar el escudo.");
    im.src = src;
  }

  function buildStickerUI() {
    sticker.img = null; sticker.src = null; sticker.size = 25; sticker.pos = "br";

    if (!R || !R.stickerDesbloqueado()) {
      stickerBox.innerHTML = `<p class="fx-sticker-title">Sticker de equipo</p>
        <p class="fx-locked">Bloqueado. Gana la Trivia o completa una entrada en el Juego para desbloquearlo.</p>`;
      return;
    }
    const lista = getStickers();
    if (!lista.length) {
      stickerBox.innerHTML = `<p class="fx-sticker-title">Sticker de equipo <span class="fx-badge">Recompensa</span></p>
        <p class="fx-locked">No se encontraron escudos de equipos para usar como sticker.</p>`;
      return;
    }

    const posBtn = (p, label, arrow) =>
      `<button type="button" data-pos="${p}" aria-label="${label}"${p === "br" ? ' class="is-active"' : ""}>${arrow}</button>`;
    stickerBox.innerHTML = `
      <p class="fx-sticker-title">Sticker de equipo <span class="fx-badge">Recompensa</span></p>
      <div class="sticker-row">
        <button type="button" class="sticker-btn is-active" data-i="-1" aria-label="Sin sticker">Ninguno</button>
        ${lista.map((s, i) => `<button type="button" class="sticker-btn" data-i="${i}" aria-label="${esc(s.nombre)}" title="${esc(s.nombre)}"><img src="${esc(s.src)}" alt="" draggable="false"></button>`).join("")}
      </div>
      <div class="fx-row"><label for="fxStickerSize">Tamaño <output></output></label>
        <input type="range" class="form-range" id="fxStickerSize" min="10" max="60" value="25"></div>
      <div class="sticker-pos" role="group" aria-label="Posición del sticker">
        ${posBtn("tl", "Arriba izquierda", "↖")}${posBtn("tr", "Arriba derecha", "↗")}
        ${posBtn("bl", "Abajo izquierda", "↙")}${posBtn("br", "Abajo derecha", "↘")}
      </div>`;

    stickerBox.querySelector(".sticker-row").addEventListener("click", e => {
      const btn = e.target.closest(".sticker-btn");
      if (!btn) return;
      stickerBox.querySelectorAll(".sticker-btn").forEach(b => b.classList.toggle("is-active", b === btn));
      const i = +btn.dataset.i;
      loadSticker(i >= 0 ? lista[i].src : null);
    });
    stickerBox.querySelector("#fxStickerSize").addEventListener("input", e => {
      sticker.size = +e.target.value;
      scheduleDraw();
    });
    stickerBox.querySelector(".sticker-pos").addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      stickerBox.querySelectorAll(".sticker-pos button").forEach(b => b.classList.toggle("is-active", b === btn));
      sticker.pos = btn.dataset.pos;
      scheduleDraw();
    });
    updateOutputs();
  }

  const LUT = (() => {
    const stops = [[0, 0, 0, 40], [.25, 60, 0, 140], [.5, 220, 30, 60], [.75, 255, 170, 0], [1, 255, 255, 200]];
    const out = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let k = 0;
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const [p0, ...c0] = stops[k], [p1, ...c1] = stops[k + 1];
      const f = (t - p0) / (p1 - p0);
      for (let c = 0; c < 3; c++) out[i * 3 + c] = c0[c] + (c1[c] - c0[c]) * f;
    }
    return out;
  })();

  function updateOutputs() {
    overlay.querySelectorAll(".fx-row").forEach(row => {
      const s = row.querySelector("input");
      row.querySelector("output").textContent = s.id === "fxSat" ? `${s.value}%` : s.value;
    });
  }

  function draw() {
    if (!srcImg) return;
    const MAX = 1080;
    const k = Math.min(1, MAX / Math.max(srcImg.naturalWidth, srcImg.naturalHeight));
    const w = Math.round(srcImg.naturalWidth * k), h = Math.round(srcImg.naturalHeight * k);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

    const pixel = +sliders.pixel.value, blur = +sliders.blur.value;
    const thermal = +sliders.thermal.value / 100, sat = +sliders.sat.value / 100;

    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);

    if (pixel > 0) {
      const size = 1 + (pixel / 100) * 40;
      const sw = Math.max(1, Math.round(w / size)), sh = Math.max(1, Math.round(h / size));
      const small = document.createElement("canvas");
      small.width = sw; small.height = sh;
      small.getContext("2d").drawImage(srcImg, 0, 0, sw, sh);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.drawImage(srcImg, 0, 0, w, h);
    }

    if (blur > 0) {
      const radius = (blur / 100) * 20 * (w / MAX);
      const tmp = document.createElement("canvas");
      tmp.width = w; tmp.height = h;
      tmp.getContext("2d").drawImage(canvas, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (hasCtxFilter) {
        ctx.filter = `blur(${radius.toFixed(1)}px)`;
        ctx.drawImage(tmp, 0, 0);
        ctx.filter = "none";
      } else {
        const f = 1 + radius * 1.2;
        const small = document.createElement("canvas");
        small.width = Math.max(1, Math.round(w / f)); small.height = Math.max(1, Math.round(h / f));
        const sctx = small.getContext("2d");
        sctx.drawImage(tmp, 0, 0, small.width, small.height);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(small, 0, 0, w, h);
      }
    }

    if (thermal > 0 || sat !== 1) {
      const img = ctx.getImageData(0, 0, w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        if (thermal > 0) {
          const l = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
          r += (LUT[l * 3] - r) * thermal;
          g += (LUT[l * 3 + 1] - g) * thermal;
          b += (LUT[l * 3 + 2] - b) * thermal;
        }
        if (sat !== 1) {
          const l = 0.299 * r + 0.587 * g + 0.114 * b;
          r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
        }
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
      }
      ctx.putImageData(img, 0, 0);
    }

    dibujarSticker(ctx, w, h);
  }

  function scheduleDraw() {
    updateOutputs();
    if (esVideo()) {
      const ancho = edVideo.clientWidth || 320;
      edVideo.style.filter = filtroCss(ancho);
      edVideo.style.transform = `scale(${1 + (radioBlur(ancho) * 4) / ancho})`;
      actualizarStickerVideo(ancho, edVideo.clientHeight);
      return;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  Object.values(sliders).forEach(s => s.addEventListener("input", scheduleDraw));

  function resetSliders() {
    Object.entries(DEFAULTS).forEach(([k, v]) => (sliders[k].value = v));
    buildStickerUI();
    scheduleDraw();
  }
  overlay.querySelector("#edReset").addEventListener("click", resetSliders);

  async function openEditor(foto) {
    const video = foto.tipo === "video";
    if (!video) {
      try { srcImg = await loadImage(foto.blob); } catch { setStatus("No se pudo abrir la foto."); return; }
    }
    activeFoto = foto;
    canvasWrap.style.display = video ? "none" : "";
    edVideoWrap.style.display = video ? "" : "none";
    soloFoto.forEach(el => (el.style.display = video ? "none" : ""));
    overlay.querySelector("#edTitle").textContent = video ? "Editar video" : "Editar foto";
    if (video) {
      videoUrl = URL.createObjectURL(foto.blob);
      edVideo.src = videoUrl;
      edVideo.play().catch(() => {});
    }
    resetSliders();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeEditor() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    edVideo.pause();
    edVideo.removeAttribute("src");
    edVideo.style.filter = "";
    edVideo.style.transform = "";
    edVideoSticker.style.display = "none";
    if (videoUrl) { URL.revokeObjectURL(videoUrl); videoUrl = null; }
    srcImg = null; activeFoto = null;
  }
  overlay.querySelector("#edClose").addEventListener("click", closeEditor);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeEditor(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeEditor();
  });

  function ocupado(si) {
    overlay.querySelectorAll(".editor-actions button").forEach(b => (b.disabled = si));
    overlay.querySelector("#edTitle").textContent = si ? "Procesando video…" : "Editar video";
    if (si) edVideo.pause();
  }

  function videoFiltrado() {
    const hayFiltro = +sliders.blur.value !== 0 || +sliders.sat.value !== 100;
    if (!hayFiltro && !sticker.img) return Promise.resolve(activeFoto.blob);
    if (hayFiltro && !hasCtxFilter) return Promise.reject(new Error("Sin soporte de filtros"));

    return new Promise((resolve, reject) => {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.src = edVideo.src;
      v.onerror = () => reject(new Error("No se pudo leer el video"));
      v.onloadedmetadata = () => {
        const c = document.createElement("canvas");
        const k = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
        c.width = Math.round((v.videoWidth * k) / 2) * 2;
        c.height = Math.round((v.videoHeight * k) / 2) * 2;
        const cx = c.getContext("2d");
        const filtro = hayFiltro ? filtroCss(c.width) : "none";
        const m = hayFiltro ? radioBlur(c.width) * 2 : 0;

        const tipo = ["video/mp4", "video/webm;codecs=vp9", "video/webm"].find(t => MediaRecorder.isTypeSupported(t));
        const rec = new MediaRecorder(c.captureStream(30), tipo ? { mimeType: tipo } : {});
        const partes = [];
        let activo = true;
        rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
        rec.onstop = () => resolve(new Blob(partes, { type: rec.mimeType || tipo }));

        const pintar = () => {
          if (!activo) return;
          cx.filter = filtro;
          cx.drawImage(v, -m, -m, c.width + m * 2, c.height + m * 2);
          cx.filter = "none";
          dibujarSticker(cx, c.width, c.height);
          requestAnimationFrame(pintar);
        };
        v.onended = () => { activo = false; rec.stop(); };
        rec.start();
        v.play().then(pintar).catch(reject);
      };
    });
  }

  async function procesarVideo() {
    ocupado(true);
    try { return await videoFiltrado(); }
    catch { alert("Tu navegador no pudo aplicar los filtros al video."); return null; }
    finally { ocupado(false); }
  }

  overlay.querySelector("#edDownload").addEventListener("click", async () => {
    if (esVideo()) {
      const blob = await procesarVideo();
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tocar_base_${Date.now()}.${blob.type.includes("mp4") ? "mp4" : "webm"}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return;
    }
    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tocar_base_${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  });

  overlay.querySelector("#edSaveCopy").addEventListener("click", async () => {
    if (esVideo()) {
      const blob = await procesarVideo();
      if (!blob) return;
      await DB.addVideo(blob, `${activeFoto.nombre} (editado)`);
      closeEditor();
      setStatus("Copia editada guardada en la galería.");
      renderGallery();
      return;
    }
    const nombre = activeFoto ? activeFoto.nombre : "foto";
    canvas.toBlob(async blob => {
      await DB.add(blob, `${nombre} (editada)`);
      closeEditor();
      setStatus("Copia editada guardada en la galería.");
      renderGallery();
    }, "image/jpeg", 0.92);
  });

  overlay.querySelector("#edDelete").addEventListener("click", async () => {
    if (!activeFoto || !confirm("¿Eliminar esta foto de la galería?")) return;
    await DB.remove(activeFoto.id);
    closeEditor();
    renderGallery();
  });

  window.addEventListener("pageshow", e => { if (e.persisted) renderGallery(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) renderGallery();
  });

  renderGallery();
});