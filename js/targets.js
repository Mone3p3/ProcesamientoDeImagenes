const container = document.querySelector('#targets-container');

const modelos = [
    '#Cubs',
    '#Cin',
    '#Brewers',
    '#Pirates',
    '#Cardinals',
    '#Braves',
    '#Miami',
    '#Mets',
    '#Phillies',
    '#Nationals',
    '#Dodgers',
    '#Diamond',
    '#Rockies',
    '#Padres',
    '#Giants'
];

modelos.forEach((modelo, index) => {

    const target = document.createElement('a-entity');

    target.setAttribute(
        'mindar-image-target',
        `targetIndex: ${index}`
    );

    const modelo3D = document.createElement('a-gltf-model');

    modelo3D.setAttribute('rotation', '0 0 0');
    modelo3D.setAttribute('position', '0 0 0');
    modelo3D.setAttribute('scale', '0.05 0.05 0.05');
    modelo3D.setAttribute('src', modelo);
    
    modelo3D.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 0');

    target.appendChild(modelo3D);
    container.appendChild(target);

    target.addEventListener('targetFound', () => {
        document.dispatchEvent(new CustomEvent('modelo-visible', { detail: { modelo3D } }));
    });
    target.addEventListener('targetLost', () => {
        document.dispatchEvent(new CustomEvent('modelo-oculto', { detail: { modelo3D } }));
    });
});

(function () {
    const toolbar = document.querySelector('.ar-toolbar');
    if (!toolbar) return;

    const visibles = new Set();
    let hideTimer = null;

    document.addEventListener('modelo-visible', (e) => {
        visibles.add(e.detail.modelo3D);
        clearTimeout(hideTimer);
        toolbar.classList.add('is-visible');
    });

    document.addEventListener('modelo-oculto', (e) => {
        visibles.delete(e.detail.modelo3D);
        if (visibles.size === 0) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (visibles.size === 0) toolbar.classList.remove('is-visible');
            }, 1500);
        }
    });
})();