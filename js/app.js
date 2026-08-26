/* =========================================================================
   app.js — Interactividad de Tocar Base
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Header sólido al hacer scroll ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Resaltar sección activa en el menú ---------- */
  const navPills = document.querySelectorAll(".nav-pill[data-section]");
  const sections = [...navPills].map(a => document.getElementById(a.dataset.section)).filter(Boolean);

  const offcanvasEl = document.getElementById("menuPanel");
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);

  navPills.forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      offcanvas.hide();
      const target = document.getElementById(pill.dataset.section);
      setTimeout(() => target?.scrollIntoView({ behavior: "smooth" }), 250);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navPills.forEach(p => p.classList.toggle("is-active", p.dataset.section === entry.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => observer.observe(s));

  /* ---------- Utilidades ---------- */
  const initials = (nombre) => nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const teamById = (id) => TEAMS.find(t => t.id === id);
  const stadiumById = (id) => STADIUMS.find(s => s.id === id);

  /* ---------- Render: carrusel de Equipos ---------- */
  const teamRail = document.getElementById("teamRail");
  TEAMS.forEach(team => {
    const el = document.createElement("div");
    el.className = "team-card";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.innerHTML = `
      <div class="team-shield" style="background:linear-gradient(145deg, ${team.color}, ${team.color2})">
        ${initials(team.nombre)}
      </div>
      <div class="name">${team.nombre}</div>
      <div class="city">${team.apodo}</div>
    `;
    const open = () => { window.location.href = `detalle.html?tipo=team&id=${encodeURIComponent(team.id)}`; };
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    teamRail.appendChild(el);
  });

  /* ---------- Render: carrusel de Estadios ---------- */
  const stadiumRail = document.getElementById("stadiumRail");
  STADIUMS.forEach(st => {
    const team = teamById(st.equipoId);
    const el = document.createElement("div");
    el.className = "stadium-card";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.innerHTML = `
      <div class="photo" style="background:linear-gradient(160deg, ${st.color}, #0a0a0a)">
        <div class="badge-mini">${team ? initials(team.nombre) : "⚾"}</div>
      </div>
      <div class="info">
        <div class="name">${st.nombre}</div>
        <div class="city">${st.ciudad}</div>
      </div>
    `;
    const open = () => { window.location.href = `detalle.html?tipo=stadium&id=${encodeURIComponent(st.id)}`; };
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    stadiumRail.appendChild(el);
  });

  /* ---------- Flechas de los carruseles horizontales ---------- */
  document.querySelectorAll("[data-rail]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rail = document.getElementById(btn.dataset.rail);
      const dir = btn.dataset.dir === "next" ? 1 : -1;
      rail.scrollBy({ left: dir * 180, behavior: "smooth" });
    });
  });

  /* ---------- Galería con editor de fotos ---------- */
  const galleryGrid = document.getElementById("galleryGrid");
  GALLERY.forEach(photo => {
    const tile = document.createElement("div");
    tile.className = "gallery-tile";
    tile.style.background = `linear-gradient(150deg, ${photo.color}, #0a0a0a)`;
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 20l5-6 4 4 4-6 3 3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="7" r="2"/></svg>
      <span>${photo.titulo}</span>
    `;
    const open = () => openEditor(photo);
    tile.addEventListener("click", open);
    tile.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    galleryGrid.appendChild(tile);
  });

  const editorOverlay = document.getElementById("editorOverlay");
  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas.getContext("2d");
  const brightness = document.getElementById("brightnessRange");
  let activeFilter = "none";
  let activePhoto = null;

  const FILTERS = {
    none: "none",
    bn: "grayscale(1)",
    sepia: "sepia(.85)",
    vintage: "sepia(.35) contrast(1.1) saturate(1.2)",
    contraste: "contrast(1.35) saturate(1.1)",
  };

  function drawPhoto() {
    canvas.width = 320;
    canvas.height = 320;
    const grad = ctx.createLinearGradient(0, 0, 320, 320);
    grad.addColorStop(0, activePhoto.color);
    grad.addColorStop(1, "#0a0a0a");

    ctx.filter = "none";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 320, 320);

    // Silueta simple tipo "pelota de béisbol" como marcador visual del contenido
    ctx.beginPath();
    ctx.arc(160, 170, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#c8102e";
    ctx.beginPath();
    ctx.arc(160, 170, 60, 0.4, 2.2);
    ctx.stroke();

    // Aplicar filtro re-dibujando con ctx.filter sobre el resultado
    const snapshot = ctx.getImageData(0, 0, 320, 320);
    const tmp = document.createElement("canvas");
    tmp.width = 320; tmp.height = 320;
    tmp.getContext("2d").putImageData(snapshot, 0, 0);

    ctx.clearRect(0, 0, 320, 320);
    ctx.filter = `${FILTERS[activeFilter]} brightness(${brightness.value}%)`;
    ctx.drawImage(tmp, 0, 0);
    ctx.filter = "none";
  }

  function openEditor(photo) {
    activePhoto = photo;
    activeFilter = "none";
    brightness.value = 100;
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("is-active", c.dataset.filter === "none"));
    document.getElementById("editorTitle").textContent = photo.titulo;
    drawPhoto();
    editorOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeEditor() {
    editorOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      drawPhoto();
    });
  });

  brightness.addEventListener("input", drawPhoto);
  document.getElementById("closeEditor").addEventListener("click", closeEditor);
  document.getElementById("cancelEditor").addEventListener("click", closeEditor);

  document.getElementById("downloadEditor").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${activePhoto.titulo.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  /* =========================================================================
     Utilidades genéricas para abrir/cerrar modales
     ========================================================================= */
  function openModal(el) { el.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeModal(el) { el.classList.remove("is-open"); document.body.style.overflow = ""; }

  /* =========================================================================
     Realidad Aumentada — botón "Escanear" → instrucciones (modal, aquí en
     Inicio) → al aceptar, se navega a la página del escáner (ar-escaner.html).
     El resto del flujo (escáner → modelo 3D) vive en sus propias páginas.
     ========================================================================= */
  const arInstructionsModal = document.getElementById("arInstructionsModal");

  document.getElementById("btnEscanear").addEventListener("click", () => openModal(arInstructionsModal));
  document.getElementById("arInstructionsOk").addEventListener("click", () => {
    window.location.href = "ar-escaner.html";
  });

  /* ---------- Año dinámico en el footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});