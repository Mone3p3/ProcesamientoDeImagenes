document.addEventListener("DOMContentLoaded", () => {

  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const navPills = document.querySelectorAll(".nav-pill[data-section]");
  const sections = [...navPills].map(a => document.getElementById(a.dataset.section)).filter(Boolean);
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("menuPanel"));

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

  const initials = (nombre) => nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  function hacerClicable(el, url) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("click", () => { window.location.href = url; });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") window.location.href = url;
    });
  }

  const teamRail = document.getElementById("teamRail");

  function renderTeamCards(zona) {
    teamRail.innerHTML = "";
    const lista = zona === "todos" ? TEAMS : TEAMS.filter(t => t.zona === zona);

    lista.forEach(team => {
      const el = document.createElement("div");
      el.className = "team-card";
      el.innerHTML = `
        <div class="team-shield" style="background:linear-gradient(145deg, ${team.color}, ${team.color2})">
          <img src="${team.escudo}" alt="Escudo de ${team.nombre} ${team.apodo}" onerror="this.remove(); this.parentElement.textContent='${initials(team.nombre)}';">
        </div>
        <div class="name">${team.nombre}</div>
        <div class="city">${team.apodo}</div>
      `;
      hacerClicable(el, `detalle.html?tipo=team&id=${encodeURIComponent(team.id)}`);
      teamRail.appendChild(el);
    });
  }
  renderTeamCards("todos");

  const botonesZona = document.querySelectorAll(".zona-filters [data-zona]");
  botonesZona.forEach(btn => {
    btn.addEventListener("click", () => {
      botonesZona.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderTeamCards(btn.dataset.zona);
    });
  });

  const stadiumRail = document.getElementById("stadiumRail");

  STADIUMS.forEach(st => {
    const el = document.createElement("div");
    el.className = "stadium-card";
    el.innerHTML = `
      <div class="photo">
        <img src="${st.fotos[0]}" alt="${st.nombre}">
        <div class="info">
          <div class="name">${st.nombre}</div>
          <div class="city">${st.ciudad}</div>
        </div>
      </div>
    `;
    hacerClicable(el, `detalle.html?tipo=stadium&id=${encodeURIComponent(st.id)}`);
    stadiumRail.appendChild(el);
  });
});