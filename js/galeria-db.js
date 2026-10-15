/* =========================================================================
   galeria-db.js — Almacenamiento compartido de la galería (IndexedDB)
   -------------------------------------------------------------------------
   Se carga en index.html y en ar-modelo.html. Ambas páginas usan la misma
   base de datos, así que una foto guardada desde la AR aparece en el index.
   Uso:
     await TocarBaseGaleria.add(blob, "Foto AR");
   ========================================================================= */
(function () {
  const DB_NAME = "tocarbase-galeria", STORE = "fotos";
  let dbPromise = null;

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () =>
          req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
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

  // Reduce la foto (máx. 1600 px) para no llenar el almacenamiento del navegador.
  function shrink(blob, max = 1600) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k);
        c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(b => (b ? resolve(b) : reject(new Error("toBlob falló"))), "image/jpeg", 0.9);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Imagen inválida")); };
      img.src = url;
    });
  }

  window.TocarBaseGaleria = {
    async add(blob, nombre = "Foto AR") {
      const small = await shrink(blob);
      return run("readwrite", s => s.add({ blob: small, nombre, fecha: Date.now() }));
    },
    getAll: () => run("readonly", s => s.getAll()),
    remove: id => run("readwrite", s => s.delete(id)),
    clear: () => run("readwrite", s => s.clear()),
  };
})();