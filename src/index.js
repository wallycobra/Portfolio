import * as THREE from "three";

const container = document.getElementById("scene-container");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// Group pivot
const group = new THREE.Group();
scene.add(group);

// Materials
const nodeMaterial = new THREE.MeshBasicMaterial({
  color: 0x3558ff,
});

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x6f7fff,
  transparent: true,
  opacity: 0.35,
});

// Nodes
const nodes = [];
const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);

const size = 6;
const spacing = 1.4;

for (let x = -size; x <= size; x++) {
  for (let y = -size; y <= size; y++) {
    const z = Math.sin(x * 0.7) * Math.cos(y * 0.7);

    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

    node.position.set(x * spacing, y * spacing, z);

    nodes.push(node);
    group.add(node);
  }
}

// Lines
for (let i = 0; i < nodes.length; i++) {
  const current = nodes[i];

  for (let j = i + 1; j < nodes.length; j++) {
    const other = nodes[j];

    const distance = current.position.distanceTo(other.position);

    if (distance < spacing * 1.45) {
      const points = [
        current.position,
        other.position,
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(geometry, lineMaterial);

      group.add(line);
    }
  }
}

// Soft glowing center shape
const torusGeometry = new THREE.TorusKnotGeometry(1.6, 0.08, 120, 16);
const torusMaterial = new THREE.MeshBasicMaterial({
  color: 0x3558ff,
  transparent: true,
  opacity: 0.65,
});

const torus = new THREE.Mesh(torusGeometry, torusMaterial);
group.add(torus);

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  group.rotation.x = Math.sin(time * 0.18) * 0.25;
  group.rotation.y += 0.0025;

  torus.rotation.x += 0.006;
  torus.rotation.y += 0.008;

  nodes.forEach((node, index) => {
    node.position.z =
      Math.sin(time * 1.2 + index * 0.15) * 0.35;
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
});