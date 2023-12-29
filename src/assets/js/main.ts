import 'destyle.css';
import * as THREE from 'three';

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
  const fovRad = (fov / 2) * (Math.PI / 180);
  const aspect = width / height;
  const size = {
    x: 1.0 * aspect,
    y: 1.0,
  };
  const dist = (size.y * 0.5) / Math.tan(fovRad);

  const camera = new THREE.PerspectiveCamera(
    fov,
    width / height,
    0.1,
    dist + 1.0
  );
  camera.position.set(0, 0, dist);
  const segment = 5;

  const geometry = new THREE.PlaneGeometry(size.x, size.y, segment, segment);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    wireframe: true,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  const onResize = () => {
    const { width, height } = getWindow();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  onResize();
  window.addEventListener('resize', onResize);

  const startTime = performance.now();
  const loop = () => {
    const elapsedTime = performance.now() - startTime;
    requestAnimationFrame(loop);
    plane.material.uniforms.uTime.value = elapsedTime;
    renderer.render(scene, camera);
  };
  loop();
};

init();
