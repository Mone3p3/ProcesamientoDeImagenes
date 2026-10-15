/* =========================================================================
   recompensas.js — Medallas y desbloqueo del sticker de equipo
   -------------------------------------------------------------------------
   Se carga en index.html, trivia-jugar.html y juego-jugar.html.
   - Guarda en localStorage qué medallas ganó la persona.
   - Dibuja las medallas en el header del index (.site-header) sin tocar su HTML.
   - El sticker de equipo del editor de la galería se desbloquea con
     cualquiera de las dos medallas.

   API:
     TocarBaseRecompensas.ganar("trivia" | "juego")  -> true si es nueva
     TocarBaseRecompensas.tiene(id)
     TocarBaseRecompensas.stickerDesbloqueado()
     TocarBaseRecompensas.bannerHTML(id, nuevo)
   ========================================================================= */
(function () {
  const KEY = "tocarbase-recompensas";

  const MEDALLAS = {
    trivia: { nombre: "Medalla de Trivia", desc: "Superaste la Trivia.", color: "#C9A227", cinta: "#e2231a" },
    juego:  { nombre: "Medalla de Base Out", desc: "Completaste una entrada en Base Out.", color: "#C0C6D0", cinta: "#1B2A5E" },
  };

  /* ---------- Almacenamiento ---------- */
  function leer() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  function guardar(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* modo privado: se ignora */ }
  }
  const tiene = (id) => !!leer()[id];
  const stickerDesbloqueado = () => Object.keys(MEDALLAS).some(tiene);

  function ganar(id) {
    if (!MEDALLAS[id]) return false;
    const data = leer();
    if (data[id]) return false; // ya la tenía
    data[id] = Date.now();
    guardar(data);
    window.dispatchEvent(new CustomEvent("recompensas-cambio"));
    renderHeader();
    return true;
  }

  /* ---------- Visual ---------- */
  function medalSVG(m, size = 22) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 1h4l2.5 9h-4z" fill="${m.cinta}"/>
      <path d="M17 1h-4l-2.5 9h4z" fill="${m.cinta}" opacity=".85"/>
      <circle cx="12" cy="16" r="6.5" fill="${m.color}" stroke="rgba(0,0,0,.3)" stroke-width="1"/>
      <circle cx="12" cy="16" r="4" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
    </svg>`;
  }

  function bannerHTML(id, nuevo) {
    const m = MEDALLAS[id];
    if (!m) return "";
    return `<div class="reward-banner" role="status">
      <span class="reward-icon">${medalSVG(m, 40)}</span>
      <span class="reward-text">
        <strong>${nuevo ? "¡Medalla desbloqueada!" : m.nombre}</strong>
        <small>${nuevo ? m.desc + " " : ""}Ya puedes usar el sticker de equipos al editar tus fotos en la Galería.</small>
      </span>
    </div>`;
  }

  function aviso(msg) {
    const t = document.createElement("div");
    t.className = "reward-toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => (t.style.opacity = "0"), 2200);
    setTimeout(() => t.remove(), 2700);
  }

  function renderHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let box = document.getElementById("headerMedals");
    if (!box) {
      box = document.createElement("div");
      box.id = "headerMedals";
      box.className = "header-medals";
      header.insertBefore(box, header.querySelector(".btn-burger") || null);
    }

    box.innerHTML = "";
    const ganadas = Object.keys(MEDALLAS).filter(tiene);
    box.hidden = ganadas.length === 0;

    ganadas.forEach(id => {
      const m = MEDALLAS[id];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "header-medal";
      b.setAttribute("aria-label", `${m.nombre}. ${m.desc}`);
      b.title = m.nombre;
      b.innerHTML = medalSVG(m, 24);
      b.addEventListener("click", () => aviso(`${m.nombre}: ${m.desc}`));
      box.appendChild(b);
    });
  }

  /* ---------- Estilos (se inyectan solos) ---------- */
  function injectStyles() {
    if (document.getElementById("recompensas-css")) return;
    const st = document.createElement("style");
    st.id = "recompensas-css";
    st.textContent = `
      .header-medals{display:flex;align-items:center;gap:6px;margin-left:auto;margin-right:12px}
      .header-medals[hidden]{display:none}
      .header-medal{width:36px;height:36px;border-radius:50%;border:0;padding:0;cursor:pointer;
        display:grid;place-items:center;background:rgba(255,255,255,.08)}
      .header-medal:focus-visible{outline:2px solid #C9A227;outline-offset:2px}
      .reward-banner{display:flex;align-items:center;gap:12px;margin:14px auto;padding:10px 14px;max-width:340px;
        text-align:left;border-radius:14px;background:rgba(201,162,39,.14);border:1px solid rgba(201,162,39,.5);color:#fff}
      .reward-icon{flex:0 0 auto;display:grid;place-items:center}
      .reward-text{display:flex;flex-direction:column;gap:2px;line-height:1.25}
      .reward-text strong{font-size:.95rem}
      .reward-text small{font-size:.78rem;opacity:.8}
      .reward-toast{position:fixed;left:50%;bottom:calc(40px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);
        background:rgba(10,10,10,.92);color:#fff;padding:10px 18px;border-radius:999px;max-width:90vw;text-align:center;
        font:600 14px Barlow,sans-serif;z-index:9999;pointer-events:none;transition:opacity .4s}
    `;
    document.head.appendChild(st);
  }

  window.TocarBaseRecompensas = { MEDALLAS, tiene, ganar, stickerDesbloqueado, bannerHTML, aviso };

  function init() { injectStyles(); renderHeader(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.addEventListener("storage", renderHeader);
  window.addEventListener("pageshow", e => { if (e.persisted) renderHeader(); });
})();