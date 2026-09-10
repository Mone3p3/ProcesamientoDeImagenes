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

    const modelo3D = document.createElement('a-entity');

    modelo3D.setAttribute('gltf-model', modelo);
    modelo3D.setAttribute('position', '0 0 0');
    modelo3D.setAttribute('scale', '0.1 0.1 0.1');

    target.appendChild(modelo3D);
    container.appendChild(target);

});