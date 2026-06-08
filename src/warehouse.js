import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Scene
const scene = new THREE.Scene();

const container = document.getElementById("warehouse-scene");

// Camera
const aspect = container.clientWidth / container.clientHeight;

const frustumSize = 15;

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
renderer.setClearColor(0x000000, 0);
renderer.setSize(container.clientWidth, container.clientHeight);

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
const warehousePivot = new THREE.Group();

scene.add(warehousePivot);

let warehouse = null;

let warehouseMixer = null;

loader.load("../models/miniWarehouse.glb", (gltf) => {
  warehouse = gltf.scene;

  // Calculate center of the loaded model
  const box = new THREE.Box3().setFromObject(warehouse);

  const center = box.getCenter(new THREE.Vector3());

  // Move warehouse so its center aligns with the pivot group's origin
  warehouse.position.sub(center);

  // Add centered warehouse to pivot
  warehousePivot.add(warehouse);

  console.log("Animations:", gltf.animations);

  if (gltf.animations.length > 0) {
    warehouseMixer = new THREE.AnimationMixer(warehouse);

    const clip = gltf.animations[0];

    const action = warehouseMixer.clipAction(clip);

    action.reset();

    action.setLoop(THREE.LoopRepeat);

    action.play();

    console.log("Playing:", clip.name);
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (warehouseMixer) {
    warehouseMixer.update(deltaTime);
  }

  // Rotate around the centered pivot
  warehousePivot.rotation.y += deltaTime * 0.2;

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