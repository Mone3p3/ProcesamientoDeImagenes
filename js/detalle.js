

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Utilidades ---------- */
  const initials = (nombre) => nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const teamById = (id) => TEAMS.find(t => t.id === id);
  const stadiumById = (id) => STADIUMS.find(s => s.id === id);
  const listFor = (type) => (type === "team" ? TEAMS : STADIUMS);

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo") === "stadium" ? "stadium" : "team";
    const id = params.get("id");
    return { tipo, id };
  }

  /* ---------- Elementos del DOM ---------- */
  const dTop = document.querySelector(".detail-hero");
  const dShield = document.querySelector(".shield-lg");
  const dTitle = document.querySelector(".detail-name");
  const dSub = document.querySelector(".detail-sub");
  const dText = document.querySelector(".lead-text");
  const dText2 = document.querySelector(".lead-text-2");
  const dPills = document.querySelector(".stat-pills");
  const dExtra = document.querySelector(".detail-extra");

  let currentType = "team";
  let currentIndex = 0;
  let fotoIndex = 0;

  
  function sparklineSVG(valores) {
    const w = 90, h = 30, pad = 3;
    const step = (w - pad * 2) / (valores.length - 1);
    const points = valores.map((v, i) => {
      const x = pad + i * step;
      const y = v ? pad : h - pad;
      return `${x},${y}`;
    }).join(" ");
    return `<svg class="sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline points="${points}" fill="none" stroke="#4a90e2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function renderFotoCarrusel(item) {
    const fotos = item.fotos || [];
    const foto = fotos[fotoIndex] || fotos[0];
    const dots = fotos.map((_, i) =>
      `<button class="${i === fotoIndex ? "is-active" : ""}" data-foto-dot="${i}" aria-label="Foto ${i + 1}"></button>`
    ).join("");

    dExtra.innerHTML = `
      <div class="detail-gallery-head"><h3>Fotos</h3><div class="rule"></div></div>
      <div class="foto-feature" style="background:linear-gradient(150deg, ${foto ? foto.color : item.color}, #0a0a0a)"></div>     
    `;

    dExtra.querySelectorAll("[data-foto-dot]").forEach(dot => {
      dot.addEventListener("click", () => {
        fotoIndex = Number(dot.dataset.fotoDot);
        renderFotoCarrusel(item);
      });
    });
  }

  function renderEstadisticas(item) {
    const st = item.estadisticas;
    dExtra.innerHTML = `
      <div class="detail-gallery-head"><h3>Estadísticas</h3><div class="rule"></div></div>

      <div class="stat-card">
        <div class="lbl">Victorias</div>
        <div class="val">${st.victorias}</div>
        <div class="note">${st.victoriasNota}</div>
      </div>

      <div class="stat-card">
        <div class="lbl">Derrotas</div>
        <div class="val">${st.derrotas}</div>
        <div class="note">${st.pctVictorias} Porcentaje general de victorias</div>
      </div>

      <div class="stat-card">
        <div class="lbl">Porcentaje de victorias</div>
        <div class="val-row">
          <div class="val">${st.pctVictorias}</div>
          ${sparklineSVG(st.sparkline)}
        </div>
        <div class="note">Últimos 6 juegos</div>

        <div class="racha-box">
          <div class="lbl">Racha actual</div>
          <div class="val" style="font-size:1.3rem; margin-top:4px;">${st.rachaCantidad} ${st.rachaTipo}</div>
          <div class="note">Últimos 10: ${st.ultimos10}</div>
        </div>
      </div>
    `;
  }

  function renderDetail(type, id) {
    const list = listFor(type);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) {
      // Id no encontrado (URL inválida) — regresa al inicio.
      window.location.href = "index.html";
      return;
    }
    currentType = type;
    currentIndex = idx;
    fotoIndex = 0;
    const item = list[idx];

    if (type === "team") {
      dTitle.textContent = `${item.nombre} ${item.apodo}`;
      dSub.textContent = item.ciudad;
      dText.textContent = item.descripcion;
      dText2.textContent = item.descripcion;
      dPills.innerHTML = `
        <div class="stat-pill"><div class="val">${item.ciudad.split(",")[0].toUpperCase()}</div><div class="lbl">Ciudad</div></div>
        <div class="stat-pill"><div class="val">${item.fundacion}</div><div class="lbl">Inauguración</div></div>
        <div class="stat-pill"><div class="val">LMB</div><div class="lbl">Liga</div></div>
      `;
      renderEstadisticas(item);
    } else {
      const team = teamById(item.equipoId);
      dTop.style.background = `linear-gradient(160deg, ${item.color}, #0a0a0a 80%)`;
      dTitle.textContent = item.nombre;
      dSub.textContent = `Casa de ${team ? team.nombre : ""} — ${item.ciudad}`;
      dText.textContent = item.descripcion;
      dText2.textContent = item.descripcion;
      dPills.innerHTML = `
        <div class="stat-pill"><div class="val">${item.ciudad.split(",")[0].toUpperCase()}</div><div class="lbl">Ciudad</div></div>
        <div class="stat-pill"><div class="val">${item.inauguracion}</div><div class="lbl">Inauguración</div></div>
        <div class="stat-pill"><div class="val">${item.capacidad}</div><div class="lbl">Capacidad</div></div>
      `;
      renderFotoCarrusel(item);
    }

    window.scrollTo({ top: 0 });
    document.title = `${type === "team" ? item.nombre : item.nombre} — Tocar Base`;
  }

  // Actualiza la URL (sin recargar la página) y vuelve a renderizar.
  function goTo(type, id) {
    const url = `detalle.html?tipo=${type}&id=${encodeURIComponent(id)}`;
    history.pushState({ type, id }, "", url);
    renderDetail(type, id);
  }

  function stepDetail(dir) {
    const list = listFor(currentType);
    const next = (currentIndex + dir + list.length) % list.length;
    goTo(currentType, list[next].id);
  }




  /* ---------- Carga inicial ---------- */
  const { tipo, id } = getParams();
  if (!id) {
    window.location.href = "index.html";
  } else {
    renderDetail(tipo, id);
  }
});
