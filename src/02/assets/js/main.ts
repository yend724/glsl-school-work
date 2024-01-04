import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

// import { gsap } from 'gsap';
import { Pane } from 'tweakpane';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import { getWindow, getCanvas } from './utils';

const init = async () => {
  const pane = new Pane();
  const PARAMS = {
    _duration: 0.0,
  };
  pane.addBinding(PARAMS, '_duration', {
    slider: true,
    min: 0,
    max: 1,
    label: 'duration',
  });

  const { width, height } = getWindow();
  const canvas = getCanvas();

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  const scene = new THREE.Scene();

  const fov = 60;
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(5, 5, 5);

  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const planeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uDuration: { value: PARAMS._duration },
    },
    transparent: true,
    fragmentShader: FragmentShader,
    vertexShader: VertexShader,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;

    plane.material.uniforms.uTime.value = elapsedTime;
    plane.material.uniforms.uDuration.value = PARAMS._duration;

    renderer.setClearColor(0x222222, 1.0);
    renderer.render(scene, camera);

    controls.update();
  };
  loop();

  const onResize = () => {
    const { width, height } = getWindow();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  onResize();
  window.addEventListener('resize', onResize);
};

init();
