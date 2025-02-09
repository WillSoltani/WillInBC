
(function() {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const loader = new THREE.TextureLoader();
  const starTexture = loader.load("https://threejs.org/examples/textures/sprites/disc.png");

  const particleCount = 1500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const offsets = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
    offsets[ix] = x;
    offsets[ix + 1] = y;
    offsets[ix + 2] = z;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const defaultPalette = [ new THREE.Color(0x800080), new THREE.Color(0x8B4513) ];
  let lockedPalette = null;

  function updateParticleColors(palette) {
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[ix] = col.r;
      colors[ix + 1] = col.g;
      colors[ix + 2] = col.b;
    }
    geometry.attributes.color.needsUpdate = true;
  }
  updateParticleColors(defaultPalette);

  const material = new THREE.PointsMaterial({
    map: starTexture,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const clock = new THREE.Clock();
  function animateBg() {
    requestAnimationFrame(animateBg);
    const time = clock.getElapsedTime();
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      posAttr.array[ix] = offsets[ix] + Math.sin(time + offsets[ix] * 0.5) * 0.5;
      posAttr.array[ix + 1] = offsets[ix + 1] + Math.cos(time + offsets[ix + 1] * 0.5) * 0.5;
      posAttr.array[ix + 2] = offsets[ix + 2] + Math.sin(time + offsets[ix + 2] * 0.5) * 0.5;
    }
    posAttr.needsUpdate = true;
    particles.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animateBg();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    const paletteData = option.getAttribute('data-palette');
    const colorsArr = paletteData.split(',').map(c => c.trim());
    option.style.background = `linear-gradient(135deg, ${colorsArr[0]} 50%, ${colorsArr[1]} 50%)`;

    option.addEventListener('mouseenter', function() {
      if (!lockedPalette) {
        const palette = colorsArr.map(c => new THREE.Color(c));
        updateParticleColors(palette);
      }
    });
    option.addEventListener('click', function() {
      const palette = colorsArr.map(c => new THREE.Color(c));
      lockedPalette = palette;
      updateParticleColors(palette);
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  const colorPicker = document.getElementById('color-picker');
  if (colorPicker) {
    colorPicker.addEventListener('mouseleave', function() {
      if (!lockedPalette) {
        updateParticleColors(defaultPalette);
      }
    });
  }
})();
