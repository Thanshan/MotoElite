/**
 * three-bike.js — Highly Realistic Yamaha MT-15 V2 3D Model
 * Exact proportions, Deltabox frame, predator face, muscular tank, underbelly exhaust.
 */

function initThreeBike(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const w = canvas.clientWidth || 800;
  const h = canvas.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = 3001; // THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();

  // --- Camera Setup (UNCHANGED) ---
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(3.5, 2.2, 5.5);
  camera.lookAt(0, 0.6, 0);

  // --- Lighting Setup (UNCHANGED) ---
  const ambientLight = new THREE.AmbientLight(0x1a1a24, 1.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
  mainLight.position.set(5, 8, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.bias = -0.0005;
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x0088ff, 3.0);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  const spotLight = new THREE.SpotLight(0xffffff, 4.0, 15, Math.PI / 5, 0.6, 1);
  spotLight.position.set(0, 6, 2);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // --- Materials (UNCHANGED) ---
  const paintBlueMat = new THREE.MeshStandardMaterial({
    color: 0x001c44, // Deep Premium Yamaha Blue
    metalness: 0.8,
    roughness: 0.15,
  });

  const darkGreyMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    metalness: 0.8,
    roughness: 0.3,
  });

  const blackMetal = new THREE.MeshStandardMaterial({
    color: 0x080808,
    metalness: 0.9,
    roughness: 0.5,
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.7,
    roughness: 0.6,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // USD Fork Gold
    metalness: 0.9,
    roughness: 0.2,
  });

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x8c6d46, // Exhaust Header Bronze
    metalness: 0.8,
    roughness: 0.4,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.9,
    metalness: 0.1,
  });

  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.95,
    metalness: 0.05,
  });

  const emissiveWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3.0
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.9,
    roughness: 0.0,
    transparent: true,
    opacity: 0.8
  });

  // --- BIKE GEOMETRY (REBUILT FOR EXACT MT-15 V2 PROPORTIONS) ---
  const bike = new THREE.Group();
  scene.add(bike);

  // Model in true meters, scale up to fit camera viewport beautifully
  const BIKE_SCALE = 2.4; 
  bike.scale.set(BIKE_SCALE, BIKE_SCALE, BIKE_SCALE);
  bike.position.y = 0.0;

  // Real-world Dimensions (meters)
  const wheelbase = 1.33;
  const rearX = -wheelbase / 2;
  const frontX = wheelbase / 2;
  const wheelRFront = 0.29; 
  const wheelRRear = 0.30; 
  const rake = -0.45; // 25.7 degrees rake angle

  // Helper for perfect smooth contours
  function extrudePath(points, depth, material, x=0, y=0, z=0, bevel=0.01) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for(let i=1; i<points.length; i++) {
        if(points[i].length === 2) shape.lineTo(points[i][0], points[i][1]);
        else if(points[i].length === 4) shape.quadraticCurveTo(points[i][0], points[i][1], points[i][2], points[i][3]);
        else if(points[i].length === 6) shape.bezierCurveTo(points[i][0], points[i][1], points[i][2], points[i][3], points[i][4], points[i][5]);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });
    geo.center();
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bike.add(mesh);
    return mesh;
  }

  const addBasic = (geo, mat, x=0, y=0, z=0, rx=0, ry=0, rz=0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bike.add(mesh);
    return mesh;
  };

  // --- Real Wheels & Tires ---
  const buildWheel = (x, isRear) => {
    const r = isRear ? wheelRRear : wheelRFront;
    const tWidth = isRear ? 0.07 : 0.05; // 140 rear, 100 front
    const group = new THREE.Group();
    group.position.set(x, r, 0);

    // Tire
    group.add(new THREE.Mesh(new THREE.TorusGeometry(r - tWidth, tWidth, 24, 64), tireMat));
    // Rim
    group.add(new THREE.Mesh(new THREE.TorusGeometry(r - tWidth - 0.02, 0.015, 16, 64), paintBlueMat));
    // Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 24), blackMetal);
    hub.rotation.x = Math.PI / 2;
    group.add(hub);

    // Precise MT-15 Y-Spokes (10 thin branches)
    for(let i=0; i<10; i++) {
      const angle = (i/10) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, r - tWidth, 12), paintBlueMat);
      spoke.position.set(Math.cos(angle) * (r - tWidth)/2, Math.sin(angle) * (r - tWidth)/2, 0);
      spoke.rotation.z = angle + Math.PI/2;
      spoke.rotation.x = 0.05; // Aero twist
      group.add(spoke);
    }

    // Brake Disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(isRear ? 0.11 : 0.14, isRear ? 0.11 : 0.14, 0.005, 32), engineMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.z = isRear ? 0.06 : 0.04;
    group.add(disc);

    // Brake Caliper
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.03), goldMat);
    caliper.position.set(isRear ? -0.08 : 0.1, 0.05, isRear ? 0.06 : 0.04);
    caliper.rotation.z = isRear ? 0.5 : -0.5;
    group.add(caliper);

    bike.add(group);
    return group;
  };

  buildWheel(rearX, true);
  buildWheel(frontX, false);

  // --- Frame & Swingarm ---
  // Authentic Deltabox Spars
  const framePoints = [
    [-0.2, 0.4], // Swingarm pivot
    [0.0, 0.65], // Upward curve
    [0.45, 0.92], // Steering head
    [0.38, 0.82], // Lower head
    [0.0, 0.55], // Inner curve
    [-0.15, 0.35] // Back to pivot
  ];
  extrudePath(framePoints, 0.16, darkGreyMat, 0, 0, 0, 0.015);

  // Swingarm (Cast Aluminum box)
  const swingarmPoints = [
    [-0.2, 0.4], [-0.66, 0.3], [-0.66, 0.35], [-0.2, 0.48]
  ];
  extrudePath(swingarmPoints, 0.03, darkGreyMat, 0, 0, 0.08, 0.005);
  extrudePath(swingarmPoints, 0.03, darkGreyMat, 0, 0, -0.08, 0.005);
  
  // Monoshock
  addBasic(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 16), goldMat, -0.15, 0.55, 0, 0, 0, -0.3);

  // --- Engine & Radiator ---
  const engX = 0.15; const engY = 0.45;
  // Crankcase
  addBasic(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 24), engineMat, engX, engY, 0, Math.PI/2, 0, 0);
  addBasic(new THREE.BoxGeometry(0.18, 0.15, 0.14), engineMat, engX - 0.08, engY, 0);
  
  // Cylinder Block & Fins (Tilted)
  const cylBlock = new THREE.Group();
  cylBlock.position.set(engX + 0.05, engY + 0.12, 0);
  cylBlock.rotation.z = -0.3; // Forward tilt
  for(let i=0; i<6; i++) {
    cylBlock.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.01, 0.14), engineMat).translateY(i * 0.025));
  }
  cylBlock.add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.15), blackMetal).translateY(6 * 0.025 + 0.03));
  bike.add(cylBlock);

  // Radiator (Slim, curved)
  const rad = addBasic(new THREE.BoxGeometry(0.04, 0.25, 0.18), darkGreyMat, 0.35, 0.65, 0, 0, 0, -0.2);
  addBasic(new THREE.BoxGeometry(0.05, 0.26, 0.2), blackMetal, 0.35, 0.65, 0, 0, 0, -0.2);

  // --- Exhaust (Exact MT-15 Underbelly Shape) ---
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.7, 0),
    new THREE.Vector3(0.28, 0.45, 0.05),
    new THREE.Vector3(0.15, 0.32, 0.06),
    new THREE.Vector3(-0.05, 0.28, 0.06)
  ]);
  addBasic(new THREE.TubeGeometry(pipeCurve, 32, 0.015, 12, false), bronzeMat);

  // Muffler chamber
  addBasic(new THREE.BoxGeometry(0.28, 0.15, 0.12), darkGreyMat, -0.05, 0.28, 0.05, 0, 0, 0.05);
  // Short sporty exhaust tip exiting right
  addBasic(new THREE.CylinderGeometry(0.018, 0.028, 0.08, 16), blackMetal, 0.1, 0.3, 0.12, Math.PI/2, -0.3, Math.PI/2);

  // --- Tank, Shrouds, Seat & Tail ---
  // Muscular Tank Core
  const tankGeo = new THREE.SphereGeometry(0.18, 32, 32);
  const tank = new THREE.Mesh(tankGeo, paintBlueMat);
  tank.scale.set(1.5, 0.9, 1.05);
  tank.position.set(0.15, 0.92, 0);
  tank.rotation.z = -0.15;
  tank.castShadow = true;
  bike.add(tank);

  // MT-15 Signature Sharp Shrouds (Air Intakes)
  const shroudPoints = [
    [0, 0], [0.28, 0.08], [0.35, -0.25], [0.1, -0.4], [0, 0]
  ];
  extrudePath(shroudPoints, 0.06, darkGreyMat, 0.2, 0.9, 0.15, 0.01);
  extrudePath(shroudPoints, 0.06, darkGreyMat, 0.2, 0.9, -0.15, 0.01);
  
  // Cyan accents on shrouds
  const shroudAccent = [
    [0, 0], [0.23, 0.05], [0.28, -0.1], [0.08, -0.2], [0, 0]
  ];
  extrudePath(shroudAccent, 0.01, paintBlueMat, 0.22, 0.9, 0.21, 0.005);
  extrudePath(shroudAccent, 0.01, paintBlueMat, 0.22, 0.9, -0.21, 0.005);

  // Split Seat
  const riderSeat = [
    [-0.2, 0], [0, 0.04], [0.15, 0.08], [0.18, 0], [-0.2, -0.05]
  ];
  extrudePath(riderSeat, 0.14, seatMat, -0.1, 0.86, 0, 0.01);

  const pillionSeat = [
    [-0.35, 0.1], [-0.15, 0.15], [-0.05, 0.08], [-0.05, 0], [-0.35, 0]
  ];
  extrudePath(pillionSeat, 0.12, seatMat, -0.3, 0.88, 0, 0.01);

  // Sharp Raised Tail
  const tailPoints = [
    [0, 0], [-0.25, 0.08], [-0.42, 0.2], [-0.45, 0.15], [-0.25, 0.02], [0, -0.05]
  ];
  extrudePath(tailPoints, 0.14, paintBlueMat, -0.15, 0.86, 0, 0.01);

  // Tail Light & License Plate Holder
  addBasic(new THREE.BoxGeometry(0.02, 0.02, 0.08), emissiveWhite, -0.6, 0.98, 0).material.color.setHex(0xff0000);
  addBasic(new THREE.BoxGeometry(0.02, 0.02, 0.08), emissiveWhite, -0.6, 0.98, 0).material.emissive.setHex(0xff0000);
  const fenderPoints = [[0, 0], [-0.15, -0.15], [-0.12, -0.16], [0.02, 0]];
  extrudePath(fenderPoints, 0.08, blackMetal, -0.55, 0.95, 0, 0.005);

  // Rear Tire Hugger
  const huggerCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 32, 1, false, Math.PI/2, Math.PI/3), blackMetal);
  huggerCurve.position.set(rearX, 0.31, 0);
  bike.add(huggerCurve);

  // --- Front End (Forks, Steering, Headlight) ---
  const forkLen = 0.65;
  const upperLen = 0.45;
  const lowerLen = 0.35;
  const forkTopY = 1.0;
  const forkTopX = frontX - Math.sin(-rake)*forkLen;

  const buildFork = (z) => {
    // Upper Gold
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, upperLen, 24), goldMat);
    upper.position.set(forkTopX + Math.sin(-rake)*(upperLen/2), forkTopY - Math.cos(-rake)*(upperLen/2), z);
    upper.rotation.z = rake;
    bike.add(upper);
    // Lower Black Slider
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, lowerLen, 24), blackMetal);
    lower.position.set(frontX - Math.sin(-rake)*(lowerLen/2), wheelRFront + Math.cos(-rake)*(lowerLen/2), z);
    lower.rotation.z = rake;
    bike.add(lower);
  };
  buildFork(0.08);
  buildFork(-0.08);

  // Triple Clamps
  addBasic(new THREE.BoxGeometry(0.06, 0.02, 0.2), blackMetal, forkTopX, forkTopY, 0, 0, 0, rake);
  addBasic(new THREE.BoxGeometry(0.06, 0.02, 0.2), blackMetal, forkTopX + 0.08, forkTopY - 0.2, 0, 0, 0, rake);

  // Front Fender
  const fFenderPoints = [[-0.1, -0.05], [0, 0.05], [0.15, -0.05], [0.15, -0.07], [0, 0.02], [-0.1, -0.07]];
  extrudePath(fFenderPoints, 0.08, paintBlueMat, frontX, wheelRFront + 0.04, 0, 0.005).rotation.z = -0.2;

  // Handlebars & Mirrors
  addBasic(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 16), blackMetal, forkTopX - 0.02, forkTopY + 0.05, 0, Math.PI/2, 0, 0);
  addBasic(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 16), tireMat, forkTopX - 0.02, forkTopY + 0.05, 0.3, Math.PI/2, 0, 0); // grips
  addBasic(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 16), tireMat, forkTopX - 0.02, forkTopY + 0.05, -0.3, Math.PI/2, 0, 0);
  // Mirrors
  addBasic(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 8), blackMetal, forkTopX - 0.05, forkTopY + 0.12, 0.2, 0, 0, 0.2);
  addBasic(new THREE.BoxGeometry(0.06, 0.03, 0.08), blackMetal, forkTopX - 0.08, forkTopY + 0.18, 0.22);
  addBasic(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 8), blackMetal, forkTopX - 0.05, forkTopY + 0.12, -0.2, 0, 0, 0.2);
  addBasic(new THREE.BoxGeometry(0.06, 0.03, 0.08), blackMetal, forkTopX - 0.08, forkTopY + 0.18, -0.22);

  // LCD Dash
  addBasic(new THREE.BoxGeometry(0.01, 0.06, 0.12), glassMat, forkTopX + 0.02, forkTopY + 0.08, 0, 0, 0, -0.5);

  // --- Exact MT-15 Predator Headlight ---
  const hlGroup = new THREE.Group();
  hlGroup.position.set(forkTopX + 0.05, forkTopY - 0.2, 0);
  hlGroup.rotation.z = -0.1;

  // Compact Cowl
  const cowlPoints = [[0, 0.08], [0.06, 0.12], [0.08, 0], [0.03, -0.06]];
  extrudePath(cowlPoints, 0.12, darkGreyMat, 0, 0, 0, 0.01);
  const cowlTop = [[0, 0], [0.06, 0.04], [0.1, 0], [0.05, -0.02]];
  extrudePath(cowlTop, 0.12, paintBlueMat, 0, 0.1, 0, 0.01);
  
  hlGroup.add(bike.children[bike.children.length-2]); // attach extrudes to hlGroup
  hlGroup.add(bike.children[bike.children.length-1]);

  // Central Projector Lens
  const proj = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 24), emissiveWhite);
  proj.position.set(0.08, 0.02, 0);
  hlGroup.add(proj);

  // Aggressive DRL Eyebrows
  const drlR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.005, 0.02), emissiveWhite);
  drlR.position.set(0.08, 0.12, 0.06);
  drlR.rotation.set(-0.2, 0.3, -0.2);
  hlGroup.add(drlR);

  const drlL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.005, 0.02), emissiveWhite);
  drlL.position.set(0.08, 0.12, -0.06);
  drlL.rotation.set(0.2, -0.3, -0.2);
  hlGroup.add(drlL);

  bike.add(hlGroup);

  // --- Footpegs ---
  addBasic(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 12), blackMetal, 0.15, 0.35, 0.18, Math.PI/2, 0, 0);
  addBasic(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 12), blackMetal, 0.15, 0.35, -0.18, Math.PI/2, 0, 0);

  // --- Showroom Floor Environment (UNCHANGED) ---
  const floorGeo = new THREE.PlaneGeometry(25, 25);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x07070b,
    metalness: 0.9,
    roughness: 0.15,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ringGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(2.5 + i * 0.8, 2.55 + i * 0.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.1 - i * 0.02,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    ring.rotation.x = -Math.PI / 2;
    ringGroup.add(ring);
  }
  scene.add(ringGroup);

  scene.fog = new THREE.Fog(0x07070b, 6, 22);

  // --- Resize Handler (UNCHANGED) ---
  const handleResize = () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (nw === 0 || nh === 0) return;
    renderer.setSize(nw, nh, false);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', handleResize, { passive: true });

  // --- Animation Loop (UNCHANGED) ---
  let frame = 0;
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    frame += delta;

    bike.rotation.y = frame * 0.4;
    ringGroup.rotation.y = frame * -0.15;
    bike.position.y = Math.sin(frame * 1.5) * 0.03;

    spotLight.position.x = Math.sin(frame * 0.8) * 6;
    spotLight.position.z = Math.cos(frame * 0.8) * 6;

    renderer.render(scene, camera);
  };
  
  animate();
}

window.initThreeBike = initThreeBike;
