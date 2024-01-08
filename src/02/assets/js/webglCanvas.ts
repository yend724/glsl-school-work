import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import { getWindow, createCanvas } from './utils';
import { parameterInit } from './parameter';

const { PARAMS } = parameterInit();
export const webglInit = async ({
  textCanvas,
}: {
  textCanvas: HTMLCanvasElement;
}) => {
  const { width, height } = getWindow();
  const canvas = createCanvas('webgl');

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  const scene = new THREE.Scene();

  const fov = 60;
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(0, 0, 200);

  const controls = new OrbitControls(camera, renderer.domElement);

  const p5canvasCtx = textCanvas.getContext('2d')!;
  const imgData = p5canvasCtx.getImageData(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );

  const textureCoordinates: {
    x: number;
    y: number;
    z: number;
  }[] = [];
  const textureColors: { r: number; g: number; b: number }[] = [];
  const dotScale = 1;

  for (let x = 0; x < imgData.width; x += dotScale) {
    for (let y = 0; y < imgData.height; y += dotScale) {
      const i = (y * imgData.width + x) * 4;
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];

      const greyscale = r * 0.222 + g * 0.707 + b * 0.071;
      if (greyscale > 240) continue;

      const _x = x * 0.5 - textCanvas.width * 0.125;
      const _y = -1 * (y * 0.5 - textCanvas.height * 0.125);
      const _z = Math.random() * 2 - 1;
      textureCoordinates.push({ x: _x, y: _y, z: _z });
      textureColors.push({ r: r / 255, g: g / 255, b: b / 255 });
    }
  }

  const obj = new THREE.Object3D();
  const particleGeometry = new THREE.IcosahedronGeometry(0.5, 0);
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0.0,
      },
      uProgress: {
        value: PARAMS.progress,
      },
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    side: THREE.DoubleSide,
  });

  const instancedMesh = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    textureCoordinates.length
  );
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }
  scene.add(instancedMesh);

  for (let i = 0; i < textureCoordinates.length; i++) {
    const position = {
      x: textureCoordinates[i].x - 50,
      y: textureCoordinates[i].y + 50,
      z: textureCoordinates[i].z,
    };
    obj.position.set(position.x, position.y, position.z);
    obj.updateMatrix();

    const color = new THREE.Color(
      textureColors[i].r,
      textureColors[i].g,
      textureColors[i].b
    );

    instancedMesh.setMatrixAt(i, obj.matrix);
    instancedMesh.setColorAt(i, color);
  }

  const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;
    particleMaterial.uniforms.uTime.value = elapsedTime * 0.001;
    particleMaterial.uniforms.uProgress.value = PARAMS.progress;

    renderer.setClearColor(0xffffff, 1.0);
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
