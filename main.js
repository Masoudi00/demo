// main.js
// Animation: Text vibration (quantum), converge to dot, morph to infinity, morph to 3D sphere

window.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const title = document.getElementById('main-title');
  const spans = Array.from(title.querySelectorAll('span'));
  const dot = document.getElementById('dot');
  const svgStage = document.getElementById('svg-stage');
  const threeStage = document.getElementById('three-stage');

  // --- GSAP Timeline ---
  const master = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  // --- 1. Quantum Vibration (Text) ---
  master.addLabel('vibration');
  master.fromTo(spans, {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    color: '#fff',
    textShadow: '0 0 16px #00fff7, 0 0 2px #fff',
  }, {
    // Sine/elastic vibration for each letter
    duration: 1.1,
    y: (i) => Math.sin(i * 0.7) * 18,
    scaleX: (i) => 1 + Math.sin(i * 0.5) * 0.3,
    scaleY: (i) => 1 + Math.cos(i * 0.5) * 0.3,
    color: '#00fff7',
    textShadow: '0 0 32px #00fff7, 0 0 8px #fff',
    stagger: {
      each: 0.04,
      from: 'center',
      ease: 'sine.inOut',
    },
    repeat: 2,
    yoyo: true,
    ease: 'elastic.inOut(1, 0.5)',
  }, 'vibration')
  .to(spans, {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    color: '#fff',
    textShadow: '0 0 16px #00fff7, 0 0 2px #fff',
    duration: 0.4,
    stagger: {
      each: 0.02,
      from: 'center',
    },
    ease: 'power2.out',
  }, 'vibration+=1.2');

  // --- 2. Converge to Dot ---
  master.addLabel('converge', 'vibration+=1.7');
  master.to(spans, {
    // Move all letters to center of their parent (h1)
    x: (i, el) => {
      const rect = el.getBoundingClientRect();
      const parentRect = title.getBoundingClientRect();
      return parentRect.left + parentRect.width / 2 - (rect.left + rect.width / 2);
    },
    y: (i, el) => {
      const rect = el.getBoundingClientRect();
      const parentRect = title.getBoundingClientRect();
      return parentRect.top + parentRect.height / 2 - (rect.top + rect.height / 2);
    },
    scale: 0.1,
    opacity: 0.7,
    duration: 0.7,
    stagger: {
      each: 0.02,
      from: 'center',
    },
    ease: 'power3.in',
    onStart: () => {
      dot.style.display = 'block';
      dot.style.opacity = 0;
    },
    onComplete: () => {
      title.style.opacity = 0;
      title.style.display = 'none';
      gsap.to(dot, { opacity: 1, duration: 0.3, ease: 'power1.in' });
    }
  }, 'converge')
  // Shrink all spans to nothing
  .to(spans, {
    opacity: 0,
    duration: 0.2,
    pointerEvents: 'none',
  }, 'converge+=0.6');

  // --- 3. Morph Dot to Circle, then to Infinity Symbol ---
  master.addLabel('dotToInfinity', 'converge+=0.8');
  master.to(dot, {
    scale: 2.5,
    boxShadow: '0 0 64px 24px #00fff7, 0 0 16px 4px #fff',
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      // Hide dot, show SVG
      dot.style.display = 'none';
      svgStage.style.display = 'flex';
      svgStage.style.opacity = 1;
    }
  }, 'dotToInfinity')
  .call(() => {
    // --- SVG Setup ---
    svgStage.innerHTML = '';
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '220');
    svg.setAttribute('height', '120');
    svg.setAttribute('viewBox', '0 0 220 120');
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.overflow = 'visible';
    svgStage.appendChild(svg);
    // Circle path (start)
    const circlePath = 'M110,60 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0';
    // Infinity path (end)
    const infinityPath = 'M30,60 C30,20 90,20 110,60 C130,100 190,100 190,60 C190,20 130,20 110,60 C90,100 30,100 30,60 Z';
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', circlePath);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#00fff7');
    path.setAttribute('stroke-width', '7');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    // Animate circle morph to infinity
    gsap.to(path, {
      duration: 1.2,
      morphSVG: infinityPath,
      ease: 'power2.inOut',
      onComplete: () => {
        // Add a glowing effect
        gsap.to(path, {
          stroke: '#fff',
          duration: 0.5,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    });
    // Store for next phase
    svgStage._svg = svg;
    svgStage._path = path;
  }, null, 'dotToInfinity+=0.5')
  // Hold infinity for a moment
  .to(svgStage, { opacity: 1, duration: 0.3 }, 'dotToInfinity+=1.2')

  // --- 4. Infinity Symbol Morphs to 3D Sphere ---
  .addLabel('infinityToSphere', 'dotToInfinity+=1.7')
  .to(svgStage._svg || {}, {
    // Animate SVG shrinking and rotating out
    scale: 0.2,
    rotation: 180,
    opacity: 0,
    transformOrigin: '50% 50%',
    duration: 0.7,
    ease: 'power2.in',
    onStart: () => {
      // Prepare Three.js
      threeStage.style.display = 'flex';
      threeStage.style.opacity = 0;
    },
    onComplete: () => {
      svgStage.style.display = 'none';
    }
  }, 'infinityToSphere')
  // Fade in 3D sphere
  .to(threeStage, {
    opacity: 1,
    duration: 0.7,
    ease: 'power2.out',
    onStart: () => {
      // --- 5. Three.js Sphere Setup ---
      // Only initialize once
      if (!threeStage._initialized) {
        setupThreeSphere(threeStage);
        threeStage._initialized = true;
      }
    }
  }, 'infinityToSphere+=0.4');

  // --- Three.js Sphere Setup ---
  function setupThreeSphere(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00fff7, 1.2, 100);
    point.position.set(0, 2, 4);
    scene.add(point);
    // Sphere
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x00fff7,
      metalness: 0.7,
      roughness: 0.18,
      clearcoat: 0.7,
      clearcoatRoughness: 0.1,
      reflectivity: 0.7,
      transmission: 0.2,
      emissive: 0x00fff7,
      emissiveIntensity: 0.12,
      sheen: 1.0,
      sheenColor: 0x00fff7,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    // Subtle floating
    let t = 0;
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      t += 0.008;
      sphere.rotation.y += 0.012;
      sphere.rotation.x = Math.sin(t) * 0.08;
      sphere.position.y = Math.sin(t * 0.7) * 0.08;
      renderer.render(scene, camera);
    }
    animate();
  }
}); 