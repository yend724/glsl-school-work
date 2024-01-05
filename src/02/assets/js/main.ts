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
  const spacing = 12; // line height
  const kerning = 1.0; // between letters

  let img: p5.Image;

  p.preload = () => {
    img = p.loadImage(Picture);
  };

  p.setup = () => {
    const canvas = p.createCanvas(400, 602);
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
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 3000);
  camera.position.set(0, 0, 500);

  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const textCanvas = getElement<HTMLCanvasElement>('#p5js-canvas > canvas');
  const textCanvasCtx = textCanvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(textCanvas);

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
  for (let x = 0; x < imgData.width; x++) {
    for (let y = 0; y < imgData.height; y++) {
      const i = (y * imgData.width + x) * 4;
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      // const a = imgData.data[i + 3];
      // const greyscale = p.round(
      //   p.red(c) * 0.222 + p.green(c) * 0.707 + p.blue(c) * 0.071
      // );
      textureCoordinates.push({ x: x / 2, y: y / 2 });
      textureColors.push({ r, g, b });
    }
  }

  // const planeGeometry = new THREE.PlaneGeometry(
  //   textCanvas.width * 0.2,
  //   textCanvas.height * 0.2
  // );
  // const planeMaterial = new THREE.ShaderMaterial({
  //   uniforms: {
  //     uTexture: { value: texture },
  //     uTime: { value: 0.0 },
  //     uDuration: { value: PARAMS._duration },
  //   },
  //   transparent: true,
  //   fragmentShader: FragmentShader,
  //   vertexShader: VertexShader,
  //   side: THREE.DoubleSide,
  // });

  // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // scene.add(plane);

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    side: THREE.DoubleSide,
  });

  const vertices = [];
  const colors = [];
  for (let i = 0; i < textureCoordinates.length; i += 3) {
    vertices.push(
      textureCoordinates[i].x * 0.5 - textCanvas.width * 0.125,
      -1 * (textureCoordinates[i].y * 0.5 - textCanvas.height * 0.125),
      1 * Math.random()
    );
    colors.push(
      textureColors[i].r / 255,
      textureColors[i].g / 255,
      textureColors[i].b / 255
    );
  }
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    // const elapsedTime = performance.now() - startTime;

    // plane.material.uniforms.uTime.value = elapsedTime;
    // plane.material.uniforms.uDuration.value = PARAMS._duration;

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
