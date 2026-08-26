/* =========================================================================
   data.js — Datos de ejemplo (mock data)
   -------------------------------------------------------------------------
   Cuando conectes la base de datos MySQL, sustituye estos arreglos por
   llamadas fetch() a tu API, por ejemplo:

     let TEAMS = [];
     fetch('/api/equipos.php').then(r => r.json()).then(data => {
       TEAMS = data;
       renderTeams();
     });

   Se mantuvieron los mismos nombres de campo que usarías como columnas
   de tabla (id, nombre, ciudad, descripcion, color, fundacion, escudo_url)
   para que el mapeo futuro sea directo. El objeto "estadisticas" de cada
   equipo se puede mapear a una tabla aparte (ej. "equipo_estadisticas")
   relacionada por equipo_id.
   ========================================================================= */

const TEAMS = [
  {
    id: "sultanes",
    nombre: "Sultanes",
    apodo: "de Monterrey",
    ciudad: "Monterrey, Nuevo León",
    color: "#1B2A5E",
    color2: "#C9A227",
    fundacion: "1939",
    estadioId: "estadio-monterrey",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 84, victoriasNota: "1ero",
      derrotas: 58,
      pctVictorias: ".592",
      sparkline: [1, 0, 1, 1, 0, 1],
      rachaTipo: "VICTORIAS", rachaCantidad: 4, ultimos10: "5-5",
    },
  },
  {
    id: "diablos-rojos",
    nombre: "Diablos Rojos",
    apodo: "del México",
    ciudad: "Ciudad de México",
    color: "#C8102E",
    color2: "#1A1A1A",
    fundacion: "1940",
    estadioId: "estadio-cdmx",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 79, victoriasNota: "2do",
      derrotas: 63,
      pctVictorias: ".556",
      sparkline: [0, 1, 1, 0, 1, 1],
      rachaTipo: "VICTORIAS", rachaCantidad: 2, ultimos10: "6-4",
    },
  },
  {
    id: "tigres-qroo",
    nombre: "Tigres",
    apodo: "de Quintana Roo",
    ciudad: "Cancún, Quintana Roo",
    color: "#F58220",
    color2: "#1A1A1A",
    fundacion: "1955",
    estadioId: "estadio-cancun",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 71, victoriasNota: "4to",
      derrotas: 71,
      pctVictorias: ".500",
      sparkline: [1, 0, 0, 1, 0, 1],
      rachaTipo: "DERROTAS", rachaCantidad: 1, ultimos10: "5-5",
    },
  },
  {
    id: "charros-jalisco",
    nombre: "Charros",
    apodo: "de Jalisco",
    ciudad: "Guadalajara, Jalisco",
    color: "#7A1F2B",
    color2: "#C9A227",
    fundacion: "1943",
    estadioId: "estadio-guadalajara",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 68, victoriasNota: "5to",
      derrotas: 74,
      pctVictorias: ".479",
      sparkline: [0, 0, 1, 0, 1, 0],
      rachaTipo: "DERROTAS", rachaCantidad: 1, ultimos10: "4-6",
    },
  },
  {
    id: "pericos-puebla",
    nombre: "Pericos",
    apodo: "de Puebla",
    ciudad: "Puebla, Puebla",
    color: "#2E7D32",
    color2: "#1A1A1A",
    fundacion: "1946",
    estadioId: "estadio-puebla",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 75, victoriasNota: "3ero",
      derrotas: 67,
      pctVictorias: ".528",
      sparkline: [1, 1, 0, 1, 0, 0],
      rachaTipo: "VICTORIAS", rachaCantidad: 1, ultimos10: "5-5",
    },
  },
  {
    id: "aguilas-veracruz",
    nombre: "Águilas",
    apodo: "de Veracruz",
    ciudad: "Veracruz, Veracruz",
    color: "#B08D2B",
    color2: "#1A1A1A",
    fundacion: "1938",
    estadioId: "estadio-veracruz",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 66, victoriasNota: "6to",
      derrotas: 76,
      pctVictorias: ".465",
      sparkline: [0, 1, 0, 0, 1, 0],
      rachaTipo: "DERROTAS", rachaCantidad: 2, ultimos10: "3-7",
    },
  },
  {
    id: "saraperos-saltillo",
    nombre: "Saraperos",
    apodo: "de Saltillo",
    ciudad: "Saltillo, Coahuila",
    color: "#5B2A86",
    color2: "#C9A227",
    fundacion: "1970",
    estadioId: "estadio-saltillo",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 61, victoriasNota: "7mo",
      derrotas: 81,
      pctVictorias: ".430",
      sparkline: [0, 0, 0, 1, 0, 1],
      rachaTipo: "VICTORIAS", rachaCantidad: 1, ultimos10: "4-6",
    },
  },
  {
    id: "rieleros-aguascalientes",
    nombre: "Rieleros",
    apodo: "de Aguascalientes",
    ciudad: "Aguascalientes, Aguascalientes",
    color: "#0D6EFD",
    color2: "#1A1A1A",
    fundacion: "1973",
    estadioId: "estadio-aguascalientes",
    descripcion: "Texto de ejemplo: reseña breve del equipo, historia y logros destacados. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    estadisticas: {
      victorias: 58, victoriasNota: "8vo",
      derrotas: 84,
      pctVictorias: ".408",
      sparkline: [0, 0, 1, 0, 0, 0],
      rachaTipo: "DERROTAS", rachaCantidad: 3, ultimos10: "2-8",
    },
  },
];

const STADIUMS = [
  {
    id: "estadio-monterrey",
    nombre: "Estadio de Beisbol Monterrey",
    equipoId: "sultanes",
    ciudad: "Monterrey, Nuevo León",
    capacidad: "27,398",
    inauguracion: "2019",
    color: "#1B2A5E",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#1B2A5E", caption: "Descripción de la foto" },
      { color: "#C9A227", caption: "Descripción de la foto" },
      { color: "#0a3d62", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-cdmx",
    nombre: "Estadio Alfredo Harp Helú",
    equipoId: "diablos-rojos",
    ciudad: "Ciudad de México",
    capacidad: "20,000",
    inauguracion: "2019",
    color: "#C8102E",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#C8102E", caption: "Descripción de la foto" },
      { color: "#1A1A1A", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-cancun",
    nombre: "Estadio Beto Ávila",
    equipoId: "tigres-qroo",
    ciudad: "Cancún, Quintana Roo",
    capacidad: "10,428",
    inauguracion: "1970",
    color: "#F58220",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#F58220", caption: "Descripción de la foto" },
      { color: "#1A1A1A", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-guadalajara",
    nombre: "Estadio Panamericano",
    equipoId: "charros-jalisco",
    ciudad: "Guadalajara, Jalisco",
    capacidad: "18,000",
    inauguracion: "1992",
    color: "#7A1F2B",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#7A1F2B", caption: "Descripción de la foto" },
      { color: "#C9A227", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-puebla",
    nombre: "Estadio Hermanos Serdán",
    equipoId: "pericos-puebla",
    ciudad: "Puebla, Puebla",
    capacidad: "12,000",
    inauguracion: "1972",
    color: "#2E7D32",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#2E7D32", caption: "Descripción de la foto" },
      { color: "#1A1A1A", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-veracruz",
    nombre: "Estadio Beto Ávila (Veracruz)",
    equipoId: "aguilas-veracruz",
    ciudad: "Veracruz, Veracruz",
    capacidad: "12,500",
    inauguracion: "1973",
    color: "#B08D2B",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#B08D2B", caption: "Descripción de la foto" },
      { color: "#1A1A1A", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-saltillo",
    nombre: "Estadio Francisco I. Madero",
    equipoId: "saraperos-saltillo",
    ciudad: "Saltillo, Coahuila",
    capacidad: "9,000",
    inauguracion: "1970",
    color: "#5B2A86",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#5B2A86", caption: "Descripción de la foto" },
      { color: "#C9A227", caption: "Descripción de la foto" },
    ],
  },
  {
    id: "estadio-aguascalientes",
    nombre: "Estadio Alberto Romo Chávez",
    equipoId: "rieleros-aguascalientes",
    ciudad: "Aguascalientes, Aguascalientes",
    capacidad: "10,500",
    inauguracion: "1973",
    color: "#0D6EFD",
    descripcion: "Texto de ejemplo: historia, características y datos curiosos del estadio. Sustituye este contenido por la información oficial cuando conectes la base de datos.",
    fotos: [
      { color: "#0D6EFD", caption: "Descripción de la foto" },
      { color: "#1A1A1A", caption: "Descripción de la foto" },
    ],
  },
];

/* Trivia: preguntas de ejemplo de verdadero/falso.
   Cuando conectes la base de datos, sustituye este arreglo por una llamada
   fetch() a tu API (ej. /api/trivia.php) que regrese objetos con el mismo
   formato: { id, pregunta, respuesta (true/false) }. */
const TRIVIA = [
  {
    id: 1,
    pregunta: "Los Sultanes de Monterrey se fundaron en 1939.",
    respuesta: true,
  },
  {
    id: 2,
    pregunta: "El Estadio Alfredo Harp Helú es la casa de los Diablos Rojos del México.",
    respuesta: true,
  },
  {
    id: 3,
    pregunta: "Los Tigres de Quintana Roo juegan en Guadalajara, Jalisco.",
    respuesta: false,
  },
  {
    id: 4,
    pregunta: "La Liga Mexicana de Béisbol tiene equipos en más de 8 ciudades.",
    respuesta: true,
  },
  {
    id: 5,
    pregunta: "Los Charros de Jalisco se fundaron después del año 2000.",
    respuesta: false,
  },
];

/* Galería: por ahora imágenes de ejemplo generadas por CSS/canvas.
   Reemplaza `color` por una `url` real de foto cuando esté disponible.
   (Esta sección no cambió respecto a la versión anterior.) */
const GALLERY = [
  { id: 1, titulo: "Jugada en home", color: "#1B2A5E" },
  { id: 2, titulo: "Afición en las gradas", color: "#C8102E" },
  { id: 3, titulo: "Lanzamiento", color: "#2E7D32" },
  { id: 4, titulo: "Celebración", color: "#B08D2B" },
  { id: 5, titulo: "Vista del estadio", color: "#5B2A86" },
  { id: 6, titulo: "Entrenamiento", color: "#7A1F2B" },
];