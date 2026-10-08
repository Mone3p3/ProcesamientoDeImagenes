/* =========================================================================
   galeria.js — Galería con subida de fotos, editor y guardado local
   -------------------------------------------------------------------------
   - Las fotos se guardan en IndexedDB (en el navegador del usuario), así
     que siguen ahí al recargar la página. No necesita servidor.
   - El editor crea su propio HTML, solo hace falta la sección #galeria.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("galleryGrid");
  const input = document.getElementById("fotoInput");
  const btnSubir = document.getElementById("btnSubirFoto");
  const emptyMsg = document.getElementById("galleryEmpty");
  const statusEl = document.getElementById("galleryStatus");
  if (!grid || !input || !btnSubir) return;

  /* ---------- IndexedDB ---------- */
  const DB_NAME = "tocarbase-galeria", STORE = "fotos";
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  async function run(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  }
  const addFoto = (blob, nombre) => run("readwrite", s => s.add({ blob, nombre, fecha: Date.now() }));
  const getFotos = () => run("readonly", s => s.getAll());
  const deleteFoto = (id) => run("readwrite", s => s.delete(id));
  const clearFotos = () => run("readwrite", s => s.clear());

  /* ---------- Utilidades ---------- */
  function setStatus(msg) {
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
  // Reduce la foto (máx. 1600 px) para no llenar el almacenamiento del navegador.
  async function shrinkToBlob(file, max = 1600) {
    const img = await loadImage(file);
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise(res => c.toBlob(res, "image/jpeg", 0.9));
  }

  /* ---------- Galería ---------- */
  let urls = [];
  async function renderGallery() {
    urls.forEach(u => URL.revokeObjectURL(u));
    urls = [];
    grid.innerHTML = "";
    let fotos = [];
    try { fotos = (await getFotos()).sort((a, b) => b.fecha - a.fecha); }
    catch { setStatus("Tu navegador no permite guardar fotos aquí."); }

    emptyMsg.hidden = fotos.length > 0;
    fotos.forEach(foto => {
      const url = URL.createObjectURL(foto.blob);
      urls.push(url);
      const tile = document.createElement("div");
      tile.className = "gallery-tile";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", `Editar ${foto.nombre}`);
      tile.innerHTML = `<img src="${url}" alt="${foto.nombre.replace(/"/g, "")}">`;
      const open = () => openEditor(foto);
      tile.addEventListener("click", open);
      tile.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      grid.appendChild(tile);
    });
  }

  /* ---------- Subir fotos ---------- */
  // El navegador/sistema muestra su propio selector de fotos, que en celular
  // incluye los permisos ("permitir acceso a todas / seleccionar fotos").
  btnSubir.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const files = [...input.files].filter(f => f.type.startsWith("image/"));
    input.value = "";
    if (!files.length) return;
    setStatus("Guardando…");
    let ok = 0;
    for (const f of files) {
      try { await addFoto(await shrinkToBlob(f), f.name || "foto"); ok++; } catch (e) { console.error(e); }
    }
    setStatus(ok ? `${ok} foto${ok > 1 ? "s" : ""} agregada${ok > 1 ? "s" : ""}.` : "No se pudo guardar la foto.");
    renderGallery();
  });

  /* ---------- Borrar todas las fotos ---------- */
  const btnBorrarTodo = document.getElementById("btnBorrarTodo");
  if (btnBorrarTodo) {
    btnBorrarTodo.addEventListener("click", async () => {
      if (!confirm("¿Borrar TODAS las fotos de la galería? Esta acción no se puede deshacer.")) return;
      await clearFotos();
      setStatus("Galería vaciada.");
      renderGallery();
    });
  }

  /* ---------- Editor (HTML creado por JS) ---------- */
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
      <div class="fx-list">
        <div class="fx-row"><label for="fxThermal">Térmico <output></output></label>
          <input type="range" class="form-range" id="fxThermal" min="0" max="100" value="0"></div>
        <div class="fx-row"><label for="fxPixel">Pixeleado <output></output></label>
          <input type="range" class="form-range" id="fxPixel" min="0" max="100" value="0"></div>
        <div class="fx-row"><label for="fxBlur">Desenfoque <output></output></label>
          <input type="range" class="form-range" id="fxBlur" min="0" max="100" value="0"></div>
        <div class="fx-row"><label for="fxSat">Saturación <output></output></label>
          <input type="range" class="form-range" id="fxSat" min="0" max="200" value="100"></div>
      </div>
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

  // Paleta térmica (negro/azul → morado → rojo → naranja → amarillo)
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

    // 1) Pixeleado: reducir y volver a ampliar sin suavizado
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

    // 2) Desenfoque
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
        // Alternativa para Safari: reducir y ampliar con suavizado
        const f = 1 + radius * 1.2;
        const small = document.createElement("canvas");
        small.width = Math.max(1, Math.round(w / f)); small.height = Math.max(1, Math.round(h / f));
        const sctx = small.getContext("2d");
        sctx.drawImage(tmp, 0, 0, small.width, small.height);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(small, 0, 0, w, h);
      }
    }

    // 3) Térmico + saturación (pixel por pixel)
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
        d[i] = r; d[i + 1] = g; d[i + 2] = b; // Uint8ClampedArray recorta solo
      }
      ctx.putImageData(img, 0, 0);
    }
  }

  function scheduleDraw() {
    updateOutputs();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  Object.values(sliders).forEach(s => s.addEventListener("input", scheduleDraw));

  function resetSliders() {
    Object.entries(DEFAULTS).forEach(([k, v]) => (sliders[k].value = v));
    scheduleDraw();
  }
  overlay.querySelector("#edReset").addEventListener("click", resetSliders);

  async function openEditor(foto) {
    try { srcImg = await loadImage(foto.blob); } catch { setStatus("No se pudo abrir la foto."); return; }
    activeFoto = foto;
    overlay.querySelector("#edTitle").textContent = "Editar foto";
    resetSliders();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeEditor() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    srcImg = null; activeFoto = null;
  }
  overlay.querySelector("#edClose").addEventListener("click", closeEditor);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeEditor(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("is-open")) closeEditor(); });

  overlay.querySelector("#edDownload").addEventListener("click", () => {
    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `tocar_base_${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  });

  overlay.querySelector("#edSaveCopy").addEventListener("click", () => {
    canvas.toBlob(async blob => {
      await addFoto(blob, `${activeFoto.nombre} (editada)`);
      closeEditor();
      setStatus("Copia editada guardada en la galería.");
      renderGallery();
    }, "image/jpeg", 0.92);
  });

  overlay.querySelector("#edDelete").addEventListener("click", async () => {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    await deleteFoto(activeFoto.id);
    closeEditor();
    renderGallery();
  });

  renderGallery();
});
