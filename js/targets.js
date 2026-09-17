const container = document.querySelector('#targets-container');

const modelos = [
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo',
    '#zelda',
    '#modelo'
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
    modelo3D.setAttribute('animation-mixer', 'clip: *; loop: repeat');

    target.appendChild(modelo3D);
    container.appendChild(target);

});