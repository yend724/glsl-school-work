import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TextureFragmentShader from '../shader/texture.frag?raw';
import TextureVertexShader from '../shader/texture.vert?raw';
import TextParticleFragmentShader from '../shader/textParticle.frag?raw';
import TextParticleVertexShader from '../shader/textParticle.vert?raw';
import { getWindow } from './utils';
import { parameterInit } from './parameter';
import Wood from '../img/wood.png';

const { PARAMS } = parameterInit();

const loadTexture = (url: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      texture => {
        resolve(texture);
      },
      undefined,
      err => {
        reject(err);
      }
    );
  });
};

const webglApp = async ({
  canvas,
  textCanvas,
  texture,
}: {
  canvas: HTMLCanvasElement;
  textCanvas: HTMLCanvasElement;
  texture: THREE.Texture;
}) => {
  const { width, height } = getWindow();
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  const renderTarget = new THREE.WebGLRenderTarget(1200, 1200);

  const scene = new THREE.Scene();
  const sceneOffscreen = new THREE.Scene();

  const fov = 60;
  const fovRad = (fov / 2) * (Math.PI / 180);
  const dist = 300 / 2 / Math.tan(fovRad);
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(0, 0, dist);

  const cameraOffscreen = camera.clone();
  cameraOffscreen.position.set(0, 0, 180);
  cameraOffscreen.lookAt(sceneOffscreen.position);
  cameraOffscreen.aspect = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  const p5canvasCtx = textCanvas.getContext('2d')!;
  const textCanvasMagnification = textCanvas.clientWidth / textCanvas.width;
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

      const _x = x;
      const _y = -1 * y;
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
    vertexShader: TextParticleVertexShader,
    fragmentShader: TextParticleFragmentShader,
    transparent: true,
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
  for (let i = 0; i < textureCoordinates.length; i++) {
    const position = {
      x: textureCoordinates[i].x - textCanvas.width * 0.5,
      y: textureCoordinates[i].y + textCanvas.height * 0.5,
      z: textureCoordinates[i].z,
    };
    obj.position.set(
      position.x * textCanvasMagnification,
      position.y * textCanvasMagnification,
      position.z
    );
    obj.updateMatrix();

    const color = new THREE.Color(
      textureColors[i].r,
      textureColors[i].g,
      textureColors[i].b
    );

    instancedMesh.setMatrixAt(i, obj.matrix);
    instancedMesh.setColorAt(i, color);
  }

  sceneOffscreen.add(instancedMesh);

  const pictureFrameGroup = new THREE.Group();
  scene.add(pictureFrameGroup);

  const pictureFramePaperGeometry = new THREE.PlaneGeometry(200, 200);
  const pictureFramePaperMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0.0,
      },
      uProgress: {
        value: PARAMS.progress,
      },
      uTexture: { value: renderTarget.texture },
    },
    vertexShader: TextureVertexShader,
    fragmentShader: TextureFragmentShader,
    transparent: true,
  });

  const pictureFramePaper = new THREE.Mesh(
    pictureFramePaperGeometry,
    pictureFramePaperMaterial
  );
  pictureFramePaper.position.setZ(-2);
  scene.add(pictureFramePaper);

  const pictureFrameBackGeometry = new THREE.PlaneGeometry(200, 200);
  const pictureFrameBackMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const pictureFrameBack = new THREE.Mesh(
    pictureFrameBackGeometry,
    pictureFrameBackMaterial
  );
  pictureFrameBack.position.setZ(-3);
  scene.add(pictureFrameBack);

  const pictureFrameGeometry = new THREE.BoxGeometry(210, 5, 4);
  const pictureFrameMaterial = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const pictureFrame = new THREE.Mesh(
    pictureFrameGeometry,
    pictureFrameMaterial
  );
  pictureFrame.position.setZ(-1);
  const pictureFrame2 = pictureFrame.clone();
  const pictureFrame3 = pictureFrame.clone();
  const pictureFrame4 = pictureFrame.clone();

  pictureFrame.position.setY(102.5);
  pictureFrame2.position.setY(-102.5);
  pictureFrame3.position.setX(102.5);
  pictureFrame3.rotation.z = Math.PI / 2;
  pictureFrame4.position.setX(-102.5);
  pictureFrame4.rotation.z = Math.PI / 2;

  pictureFrameGroup.add(
    pictureFrame,
    pictureFrame2,
    pictureFrame3,
    pictureFrame4
  );

  const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;

    particleMaterial.uniforms.uTime.value = elapsedTime * 0.001;
    particleMaterial.uniforms.uProgress.value = PARAMS.progress;

    pictureFramePaperMaterial.uniforms.uTime.value = elapsedTime * 0.001;
    pictureFramePaperMaterial.uniforms.uProgress.value = PARAMS.progress;

    //オフスクリーンレンダリング
    renderer.setClearColor(0xffffff, 1.0);
    renderer.setRenderTarget(renderTarget);
    renderer.render(sceneOffscreen, cameraOffscreen);
    renderer.setRenderTarget(null);

    renderer.setClearColor(0x000000, 1.0);
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

    cameraOffscreen.aspect = 1;
    cameraOffscreen.updateProjectionMatrix();
  };
  onResize();
  window.addEventListener('resize', onResize);

  return {
    onResize,
  };
};

export const webglInit = async ({
  canvas,
  textCanvas,
}: {
  canvas: HTMLCanvasElement;
  textCanvas: HTMLCanvasElement;
}) => {
  return loadTexture(Wood).then(texture => {
    return webglApp({ canvas, textCanvas, texture });
  });
};
