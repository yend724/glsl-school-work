import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

// import { gsap } from 'gsap';
import { Pane } from 'tweakpane';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import Picture from '../img/pic.png';
import { getWindow, getCanvas, getElement } from './utils';
import p5 from 'p5';

const sketch = (p: p5) => {
  const inputText = 'GLSL School';

  const fontSizeMax = 16;
  const fontSizeMin = 8;
  const spacing = 8; // line height
  const kerning = 0.5; // between letters

  let img: p5.Image;

  p.preload = () => {
    img = p.loadImage(Picture);
  };

  p.setup = () => {
    const canvas = p.createCanvas(200, 200);
    canvas.parent('p5js-canvas');
    p.textFont('Times');
    p.textSize(10);
    p.textAlign(p.LEFT, p.CENTER);
  };

  p.draw = () => {
    p.background(255);

    let x = 0;
    let y = 10;
    let counter = 0;

    while (y < p.height) {
      // translate position (display) to position (image)
      img.loadPixels();
      // get current color
      const imgX = p.round(p.map(x, 0, p.width, 0, img.width));
      const imgY = p.round(p.map(y, 0, p.height, 0, img.height));
      const c = p.color(img.get(imgX, imgY));
      const greyscale = p.round(
        p.red(c) * 0.222 + p.green(c) * 0.707 + p.blue(c) * 0.071
      );

      p.push();
      p.translate(x, y);

      let fontSize = p.map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
      fontSize = p.max(fontSize, 1);
      p.textSize(fontSize);
      p.fill(c);

      let letter = inputText.charAt(counter);
      p.text(letter, 0, 0);
      let letterWidth = p.textWidth(letter) + kerning;
      // for the next letter ... x + letter width
      x += letterWidth;

      p.pop();

      if (x + letterWidth >= p.width) {
        x = 0;
        y += spacing;
      }

      counter++;
      if (counter >= inputText.length) {
        counter = 0;
      }
    }
    p.noLoop();
  };
};
new p5(sketch);

const webglInit = async () => {
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
  camera.position.set(0, 0, 400);

  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const textCanvas = getElement<HTMLCanvasElement>('#p5js-canvas > canvas');
  const textCanvasCtx = textCanvas.getContext('2d')!;
  // const texture = new THREE.CanvasTexture(textCanvas);

  const imgData = textCanvasCtx.getImageData(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );
  let textureCoordinates: {
    x: number;
    y: number;
  }[] = [];
  let textureColors: { r: number; g: number; b: number }[] = [];
  const dotscale = 1;
  for (let x = 0; x < imgData.width; x += dotscale) {
    for (let y = 0; y < imgData.height; y += dotscale) {
      const i = (y * imgData.width + x) * 4;
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];

      const greyscale = r * 0.222 + g * 0.707 + b * 0.071;
      if (greyscale > 254) continue;

      textureCoordinates.push({ x, y });
      textureColors.push({ r, g, b });
    }
  }

  const dummy = new THREE.Object3D();
  const particleGeometry = new THREE.IcosahedronGeometry(0.8, 0);
  const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    side: THREE.DoubleSide,
  });

  const vertices: { x: number; y: number; z: number }[] = [];
  const colors: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < textureCoordinates.length; i++) {
    vertices.push({
      x: textureCoordinates[i].x * 0.5 - textCanvas.width * 0.125,
      y: -1 * (textureCoordinates[i].y * 0.5 - textCanvas.height * 0.125),
      z: 5 * Math.random(),
    });
    colors.push({
      r: textureColors[i].r / 255,
      g: textureColors[i].g / 255,
      b: textureColors[i].b / 255,
    });
  }

  const instancedMesh = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    vertices.length
  );
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }
  scene.add(instancedMesh);

  for (let i = 0; i < vertices.length; i += 1) {
    dummy.position.set(vertices[i].x - 50, vertices[i].y + 50, vertices[i].z);
    dummy.updateMatrix();

    const color = new THREE.Color(colors[i].r, colors[i].g, colors[i].b);

    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.setColorAt(i, color);
  }

  // const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    // const elapsedTime = performance.now() - startTime;

    renderer.setClearColor(0xcccccc, 1.0);
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

setTimeout(() => {
  webglInit();
}, 500);
