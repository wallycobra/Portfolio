import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("chip8-scene");

// Scene
const scene = new THREE.Scene();

// Camera
const aspect = container.clientWidth / container.clientHeight;

const frustumSize = 60;

const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000
);

camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);

// Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 2, 0);
// controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Loader
const loader = new GLTFLoader();

// Pivot group
const chip8Pivot = new THREE.Group();
scene.add(chip8Pivot);

let chip8Model = null;
let chip8Mixer = null;


loader.load("../models/chip8.glb", (gltf) => {
  chip8Model = gltf.scene;

  // Center model around pivot
  const box = new THREE.Box3().setFromObject(chip8Model);
  const center = box.getCenter(new THREE.Vector3());

  chip8Model.position.sub(center);

  chip8Pivot.add(chip8Model);

  console.log("CHIP-8 Animations:", gltf.animations);

  if (gltf.animations.length > 0) {
    chip8Mixer = new THREE.AnimationMixer(chip8Model);

    const clip = gltf.animations[0];

    const action = chip8Mixer.clipAction(clip);

    action.reset();
    action.setLoop(THREE.LoopRepeat);
    action.play();

    console.log("Playing CHIP-8 animation:", clip.name);
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (chip8Mixer) {
    chip8Mixer.update(deltaTime);
  }

  chip8Pivot.rotation.y += deltaTime * 0.2;

  // controls.update();

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  const aspect = container.clientWidth / container.clientHeight;

  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;

  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
});