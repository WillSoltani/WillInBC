window.initNewBackground2 = function() {
    const canvas = document.getElementById("bg-canvas-2");
    if (!canvas) {
      return;
    }
    if (typeof disposeCurrentBackgroundRenderer === "function") {
      disposeCurrentBackgroundRenderer();
    }
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    window.currentBackgroundRenderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(camera);
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        colorA: { value: new THREE.Color(0.05, 0.0, 0.1) },
        colorB: { value: new THREE.Color(0.5, 0.2, 0.0) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec2 vUv;
    
        mat2 rotation2d(float angle) {
            return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        }
    
        float random (in vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
    
        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
    
        void main() {
            vec2 st = vUv * 3.0;
            st *= rotation2d(time * 0.1);
            st += vec2(time * 0.05, time * 0.05);
            float n1 = noise(st);
            float n2 = noise(st * 2.0);
            float n3 = noise(st * 4.0);
            float nCombined = (n1 + 0.5 * n2 + 0.25 * n3) / 1.75;
    
            vec3 baseColor = mix(colorA, colorB, nCombined);
    
            float dist = distance(vUv, vec2(0.5));
            float glow = smoothstep(0.6, 0.3, dist);
            baseColor += glow * 0.2;
    
            gl_FragColor = vec4(baseColor, 1.0);
        }
      `
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);
    window.newBackground2Uniforms = material.uniforms;
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      material.uniforms.time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    });
  };
  