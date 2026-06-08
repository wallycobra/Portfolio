import * as THREE from "three";

const container = document.getElementById("scene-container");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  42,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.set(10, 8, 14);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.3));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(8, 12, 10);
scene.add(keyLight);

const blueLight = new THREE.PointLight(0x3558ff, 3, 30);
blueLight.position.set(-8, 4, 6);
scene.add(blueLight);

const cyanLight = new THREE.PointLight(0x00d4ff, 2, 30);
cyanLight.position.set(6, 3, -8);
scene.add(cyanLight);

const magentaLight = new THREE.PointLight(0xff4fd8, 1.8, 30);
magentaLight.position.set(0, 8, 0);
scene.add(magentaLight);

// Main group
const world = new THREE.Group();
scene.add(world);

// Materials
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xeaf0ff,
  roughness: 0.45,
  metalness: 0.12,
});

const rackMaterial = new THREE.MeshStandardMaterial({
  color: 0x3558ff,
  roughness: 0.35,
  metalness: 0.35,
  emissive: 0x1226aa,
  emissiveIntensity: 0.08,
});

const rackAltMaterial = new THREE.MeshStandardMaterial({
  color: 0x6f7fff,
  roughness: 0.35,
  metalness: 0.35,
  emissive: 0x2638cc,
  emissiveIntensity: 0.08,
});

const pathMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.25,
  metalness: 0.1,
  transparent: true,
  opacity: 0.88,
});

const robotMaterial = new THREE.MeshStandardMaterial({
  color: 0x00d4ff,
  roughness: 0.28,
  metalness: 0.45,
  emissive: 0x00a8ff,
  emissiveIntensity: 0.28,
});

const robotAltMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4fd8,
  roughness: 0.25,
  metalness: 0.45,
  emissive: 0xff4fd8,
  emissiveIntensity: 0.22,
});

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0x8affc1,
  roughness: 0.3,
  metalness: 0.2,
  emissive: 0x35ff9a,
  emissiveIntensity: 0.22,
});

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x3558ff,
  transparent: true,
  opacity: 0.22,
});

// Floor platform
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(14, 0.18, 9),
  floorMaterial
);

floor.position.y = -0.12;
world.add(floor);

// Abstract warehouse path lanes
const laneGroup = new THREE.Group();
world.add(laneGroup);

function addLane(x, z, width, depth) {
  const lane = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.045, depth),
    pathMaterial
  );

  lane.position.set(x, 0.02, z);
  laneGroup.add(lane);
}

addLane(0, 0, 12.4, 0.42);
addLane(-4.8, 0, 0.42, 7.2);
addLane(4.8, 0, 0.42, 7.2);
addLane(0, -3.2, 10, 0.32);
addLane(0, 3.2, 10, 0.32);

// Racks as abstract skyline blocks
const racks = [];
const rackGeometry = new THREE.BoxGeometry(0.55, 1, 1.15);

for (let row = -2; row <= 2; row++) {
  for (let col = -5; col <= 5; col++) {
    if (col === 0 || Math.abs(row) === 0) continue;
    if (Math.abs(col) === 5 && Math.abs(row) === 2) continue;

    const height =
      0.65 +
      Math.abs(Math.sin(col * 1.3 + row * 0.9)) *
        1.55;

    const rack = new THREE.Mesh(
      rackGeometry,
      (col + row) % 2 === 0 ? rackMaterial : rackAltMaterial
    );

    rack.scale.y = height;
    rack.position.set(
      col * 0.95,
      height * 0.5,
      row * 1.35
    );

    rack.userData.baseY = rack.position.y;
    rack.userData.phase = col * 0.8 + row * 1.4;

    racks.push(rack);
    world.add(rack);
  }
}

// Floating data nodes above warehouse
const nodes = [];
const nodeGeometry = new THREE.SphereGeometry(0.09, 18, 18);

const nodePositions = [
  [-5.8, 2.2, -3.5],
  [-3.6, 3.4, -2.0],
  [-1.2, 2.7, -3.2],
  [1.1, 3.8, -1.4],
  [3.7, 2.6, -3.0],
  [5.7, 3.5, -0.8],
  [-5.2, 3.1, 2.6],
  [-2.8, 4.0, 1.5],
  [0.0, 3.2, 3.1],
  [2.8, 4.3, 1.8],
  [5.3, 3.0, 2.8],
];

for (const pos of nodePositions) {
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
  node.position.set(pos[0], pos[1], pos[2]);
  node.userData.base = node.position.clone();
  node.userData.phase = Math.random() * Math.PI * 2;
  nodes.push(node);
  world.add(node);
}

// Connect data nodes with lines
for (let i = 0; i < nodes.length - 1; i++) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    nodes[i].position,
    nodes[i + 1].position,
  ]);

  const line = new THREE.Line(geometry, lineMaterial);
  world.add(line);
}

// Robot swarm
const robots = [];
const robotGeometry = new THREE.BoxGeometry(0.42, 0.28, 0.42);

function createRobot(colorIndex, offset, speed, radiusX, radiusZ) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    robotGeometry,
    colorIndex % 2 === 0 ? robotMaterial : robotAltMaterial
  );

  body.position.y = 0.28;

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    colorIndex % 2 === 0 ? robotAltMaterial : nodeMaterial
  );

  glow.position.set(0, 0.55, 0);

  group.add(body);
  group.add(glow);

  group.userData = {
    offset,
    speed,
    radiusX,
    radiusZ,
  };

  robots.push(group);
  world.add(group);
}

createRobot(0, 0.0, 0.65, 7.2, 4.8);
createRobot(1, 1.8, 0.52, 7.6, 5.1);
createRobot(2, 3.6, 0.72, 6.6, 4.4);
createRobot(3, 5.1, 0.47, 8.1, 5.4);

// Flowing route curves
const routeGroup = new THREE.Group();
world.add(routeGroup);

function createRoute(radiusX, radiusZ, color, opacity, y) {
  const curvePoints = [];

  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 2;

    curvePoints.push(
      new THREE.Vector3(
        Math.cos(t) * radiusX,
        y,
        Math.sin(t) * radiusZ
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });

  const line = new THREE.Line(geometry, material);
  routeGroup.add(line);
}

createRoute(4.8, 3.2, 0x00d4ff, 0.35, 0.12);
createRoute(5.7, 3.7, 0xff4fd8, 0.22, 0.14);
createRoute(3.3, 2.2, 0x8affc1, 0.28, 0.16);

// Abstract crane / signal arc
const arcPoints = [];

for (let i = 0; i <= 80; i++) {
  const t = i / 80;
  const x = -5 + t * 10;
  const y = 2.4 + Math.sin(t * Math.PI) * 2.4;
  const z = -4.2;

  arcPoints.push(new THREE.Vector3(x, y, z));
}

const arc = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(arcPoints),
  new THREE.LineBasicMaterial({
    color: 0xff4fd8,
    transparent: true,
    opacity: 0.35,
  })
);

world.add(arc);

// Camera drift target
const cameraTarget = new THREE.Vector3(0, 1.4, 0);

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  world.rotation.y = Math.sin(time * 0.22) * 0.22;
  world.rotation.x = Math.sin(time * 0.17) * 0.06;

  laneGroup.position.y = Math.sin(time * 1.1) * 0.035;

  for (const rack of racks) {
    const pulse =
      Math.sin(time * 1.5 + rack.userData.phase) * 0.04;

    rack.scale.y += pulse * 0.01;
  }

  for (const node of nodes) {
    const base = node.userData.base;
    const phase = node.userData.phase;

    node.position.y =
      base.y + Math.sin(time * 1.2 + phase) * 0.18;

    node.scale.setScalar(
      1 + Math.sin(time * 1.8 + phase) * 0.18
    );
  }

  for (const robot of robots) {
    const { offset, speed, radiusX, radiusZ } = robot.userData;

    const t = time * speed + offset;

    robot.position.x = Math.cos(t) * radiusX;
    robot.position.z = Math.sin(t) * radiusZ;
    robot.position.y = 0.12;

    const lookX = Math.cos(t + 0.03) * radiusX;
    const lookZ = Math.sin(t + 0.03) * radiusZ;

    robot.lookAt(lookX, 0.12, lookZ);
  }

  routeGroup.rotation.y += 0.001;

  camera.position.x = 10 + Math.sin(time * 0.18) * 0.9;
  camera.position.y = 8 + Math.sin(time * 0.21) * 0.45;
  camera.position.z = 14 + Math.cos(time * 0.16) * 0.9;

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect =
    container.clientWidth / container.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );
});