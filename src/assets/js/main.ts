import 'destyle.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';

const getWindow = () => {
  const win = window;
  return {
    window: win,
    width: win.innerWidth,
    height: win.innerHeight,
  };
};

const getCanvas = () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#webgl');
  if (canvas === null) {
    throw new Error('canvas is null');
  }
  return canvas;
};

const init = () => {
  const { width, height } = getWindow();
  const canvas = getCanvas();

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  const scene = new THREE.Scene();

  const fov = 60;

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
  camera.position.set(0, 0, 10);

  const controls = new OrbitControls(camera, renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0,
  });
  const box = new THREE.Mesh(geometry, material);
  group.add(box);

  // Instantiate a sampler so we can use it later
  const sampler = new MeshSurfaceSampler(box).build();

  // Define the basic geometry of the spheres
  const sparklesGeometry = new THREE.BufferGeometry();
  // Define the basic material of the spheres
  const sparklesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  });
  const points = new THREE.Points(sparklesGeometry, sparklesMaterial);
  group.add(points);

  // Create a dummy Vector to store the sampled coordinates
  const tempPosition = new THREE.Vector3();
  const tempSparklesArray: number[] = [];
  // Loop as many spheres we have
  for (let i = 0; i < 500; i++) {
    // Sample a random point on the surface of the cube
    sampler.sample(tempPosition);
    tempSparklesArray[i * 3] = tempPosition.x;
    tempSparklesArray[i * 3 + 1] = tempPosition.y;
    tempSparklesArray[i * 3 + 2] = tempPosition.z;
  }

  sparklesGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(tempSparklesArray, 3)
  );

  console.log(tempSparklesArray);

  const onResize = () => {
    const { width, height } = getWindow();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  onResize();
  window.addEventListener('resize', onResize);

  // const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    // const elapsedTime = performance.now() - startTime;
    // box.material.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
  };
  loop();
};

init();
