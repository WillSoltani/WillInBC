window.initNewBackground = function() {
  if (typeof disposeCurrentBackgroundRenderer === "function") {
    disposeCurrentBackgroundRenderer();
  }
  console.log("Custom initNewBackground: Initializing Background1.");
  const canvas = document.getElementById("bg-canvas-2");
  if (!canvas) {
    console.error("Alternate background canvas (bg-canvas-2) not found.");
    return;
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  window.currentBackgroundRenderer = renderer;
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
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const offsets = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const x = (Math.random() - 0.5) * 12;
    const y = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 12;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
    offsets[ix] = x;
    offsets[ix + 1] = y;
    offsets[ix + 2] = z;
    speeds[i] = Math.random() * 0.5 + 0.3;
    let color = new THREE.Color();
    color.setHSL(0.6, 0.5, 0.7);
    colors[ix] = color.r;
    colors[ix + 1] = color.g;
    colors[ix + 2] = color.b;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const loader = new THREE.TextureLoader();
  const particleTexture = loader.load("https://threejs.org/examples/textures/sprites/spark1.png");
  const material = new THREE.PointsMaterial({
    map: particleTexture,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    color: new THREE.Color(0xffffff)
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  window.newBackgroundUniforms = {
    color1: { value: new THREE.Color(0xffffff) },
    color2: { value: new THREE.Color(0xffffff) },
    update: function() {
      material.color.copy(new THREE.Color().lerpColors(this.color1.value, this.color2.value, 0.5));
    }
  };
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const speed = speeds[i];
      posAttr.array[ix] = offsets[ix] + Math.sin(time * speed + offsets[ix]) * 0.3;
      posAttr.array[ix + 1] = offsets[ix + 1] + Math.cos(time * speed + offsets[ix + 1]) * 0.3;
      posAttr.array[ix + 2] = offsets[ix + 2] + Math.sin(time * speed + offsets[ix + 2]) * 0.3;
    }
    posAttr.needsUpdate = true;
    window.newBackgroundUniforms.update();
    particles.rotation.y += 0.0008;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
};
