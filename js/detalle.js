document.addEventListener("DOMContentLoaded", () => {

  const initials = (nombre) => nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const teamById = (id) => TEAMS.find(t => t.id === id);

  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo") === "stadium" ? "stadium" : "team";
  const id = params.get("id");

  const dTop = document.querySelector(".detail-hero");
  const dShield = document.querySelector(".shield-lg");
  const dTitle = document.querySelector(".detail-name");
  const dSub = document.querySelector(".detail-sub");
  const dText = document.querySelector(".lead-text");
  const dText2 = document.querySelector(".lead-text-2");
  const dPills = document.querySelector(".stat-pills");
  const dExtra = document.querySelector(".detail-extra");

  function ponerEscudo(team) {
    dShield.style.background = `linear-gradient(145deg, ${team.color}, ${team.color2})`;
    dShield.innerHTML = `<img src="${team.escudo}" alt="Escudo de ${team.nombre}">`;
    dShield.querySelector("img").onerror = () => {
      dShield.textContent = initials(team.nombre);
    };
  }

  function renderFotos(item) {
    const fotos = item.fotos.map(src => `
      <div class="foto-feature" style="background: ${item.color} url('${src}') center / cover no-repeat"></div>
    `).join("");

    dExtra.innerHTML = `
      <div class="detail-gallery-head"><h3>Fotos</h3><div class="rule"></div></div>
      ${fotos}
    `;
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
        <div class="note">Temporada regular 2026</div>
      </div>

      <div class="stat-card">
        <div class="lbl">Porcentaje de victorias</div>
        <div class="val">${st.pctVictorias}</div>
        <div class="note">${st.victorias} ganados de ${st.victorias + st.derrotas} juegos</div>

        <div class="racha-box">
          <div class="lbl">Racha al cierre</div>
          <div class="val" style="font-size:1.3rem; margin-top:4px;">${st.rachaCantidad} ${st.rachaTipo}</div>
          <div class="note">Últimos 10: ${st.ultimos10}</div>
        </div>
      </div>
    `;
  }

  const lista = tipo === "team" ? TEAMS : STADIUMS;
  const item = lista.find(i => i.id === id);

  if (!item) {
    window.location.href = "index.html";
    return;
  }

  const ciudad = item.ciudad.split(",")[0].toUpperCase();

  if (tipo === "team") {
    dTop.style.background = `linear-gradient(160deg, ${item.color}, ${item.color2} 48%, #0a0a0a 90%)`;
    ponerEscudo(item);
    dTitle.textContent = `${item.nombre} ${item.apodo}`;
    dSub.textContent = item.ciudad;
    dPills.innerHTML = `
      <div class="stat-pill"><div class="val">${ciudad}</div><div class="lbl">Ciudad</div></div>
      <div class="stat-pill"><div class="val">${item.fundacion}</div><div class="lbl">Fundación</div></div>
      <div class="stat-pill"><div class="val">NL</div><div class="lbl">Liga</div></div>
    `;
    renderEstadisticas(item);
  } else {
    const team = teamById(item.equipoId);
    dTop.style.background = `linear-gradient(160deg, ${item.color}, #0a0a0a 80%)`;
    if (team) ponerEscudo(team);
    dTitle.textContent = item.nombre;
    dSub.textContent = `Casa de ${team ? team.nombre : ""} — ${item.ciudad}`;
    dPills.innerHTML = `
      <div class="stat-pill"><div class="val">${ciudad}</div><div class="lbl">Ciudad</div></div>
      <div class="stat-pill"><div class="val">${item.inauguracion}</div><div class="lbl">Inauguración</div></div>
      <div class="stat-pill"><div class="val">${item.capacidad}</div><div class="lbl">Capacidad</div></div>
    `;
    renderFotos(item);
  }

  dText.textContent = item.descripcion;
  dText2.textContent = item.descripcion;
  document.title = `${item.nombre} — Tocar Base`;
});