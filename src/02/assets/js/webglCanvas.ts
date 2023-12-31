import gsap from 'gsap';
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

class WebGLApp {
  canvas: HTMLCanvasElement;
  textCanvas: HTMLCanvasElement;
  texture: THREE.Texture;
  renderer: THREE.WebGLRenderer;
  rendererOffscreen: THREE.WebGLRenderTarget;
  scene: THREE.Scene;
  sceneOffscreen: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraOffscreen: THREE.PerspectiveCamera;
  controls: OrbitControls;
  particleMaterial: THREE.ShaderMaterial;
  pictureFramePaperMaterial: THREE.ShaderMaterial;
  startTime: number;

  constructor({
    canvas,
    textCanvas,
    texture,
  }: {
    canvas: HTMLCanvasElement;
    textCanvas: HTMLCanvasElement;
    texture: THREE.Texture;
  }) {
    this.canvas = canvas;
    this.textCanvas = textCanvas;
    this.texture = texture;

    const { width, height } = getWindow();

    this.startTime = performance.now();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.rendererOffscreen = new THREE.WebGLRenderTarget(1200, 1200);
    this.scene = new THREE.Scene();
    this.sceneOffscreen = new THREE.Scene();

    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = 300 / 2 / Math.tan(fovRad);
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, dist);

    this.cameraOffscreen = this.camera.clone();
    this.cameraOffscreen.position.set(0, 0, 180);
    this.cameraOffscreen.lookAt(this.sceneOffscreen.position);
    this.cameraOffscreen.aspect = 1.0;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.onResize = this.onResize.bind(this);
    this.registerEvents = this.registerEvents.bind(this);
    this.removeEvents = this.removeEvents.bind(this);
    this.createShaderMaterials = this.createShaderMaterials.bind(this);
    this.changeTexture = this.changeTexture.bind(this);

    const { particleMaterial, pictureFrameMaterial } =
      this.createShaderMaterials();
    this.particleMaterial = particleMaterial;
    this.pictureFramePaperMaterial = pictureFrameMaterial;

    this.init();
    this.render();
    this.onResize();
    this.registerEvents();
  }

  init = () => {
    const { textureCoordinates, textureColors, textCanvasMagnification } =
      this.getTextureCoordinatesFromCanvas(this.textCanvas);

    const instancedMesh = this.createInstancedMesh(
      textureCoordinates,
      textureColors,
      textCanvasMagnification
    );
    this.sceneOffscreen.add(instancedMesh);

    const pictureFrameGroup = this.createPictureFrame();
    this.scene.add(pictureFrameGroup);
  };

  changeTexture = (textCanvas: HTMLCanvasElement) => {
    this.textCanvas = textCanvas;
    const { textureCoordinates, textureColors, textCanvasMagnification } =
      this.getTextureCoordinatesFromCanvas(textCanvas);

    gsap.to(PARAMS, {
      progress: 1.0,
      duration: 1.0,
      onComplete: () => {
        this.sceneOffscreen.clear();
        const instancedMesh = this.createInstancedMesh(
          textureCoordinates,
          textureColors,
          textCanvasMagnification
        );
        this.sceneOffscreen.add(instancedMesh);
        gsap.to(PARAMS, {
          progress: 0.0,
          duration: 1.0,
        });
      },
    });
  };

  render = () => {
    requestAnimationFrame(this.render);

    const elapsedTime = performance.now() - this.startTime;

    this.particleMaterial.uniforms.uTime.value = elapsedTime * 0.001;
    this.particleMaterial.uniforms.uProgress.value = PARAMS.progress;

    this.pictureFramePaperMaterial.uniforms.uTime.value = elapsedTime * 0.001;
    this.pictureFramePaperMaterial.uniforms.uProgress.value = PARAMS.progress;

    this.renderer.setClearColor(0xffffff, 1.0);
    this.renderer.setRenderTarget(this.rendererOffscreen);
    this.renderer.render(this.sceneOffscreen, this.cameraOffscreen);
    this.renderer.setRenderTarget(null);

    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.render(this.scene, this.camera);

    this.controls.update();
  };

  onResize = () => {
    const { width, height } = getWindow();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.cameraOffscreen.aspect = 1;
    this.cameraOffscreen.updateProjectionMatrix();
  };

  getTextureCoordinatesFromCanvas = (canvas: HTMLCanvasElement) => {
    const canvasCtx = canvas.getContext('2d', {
      willReadFrequently: true,
    })!;
    const textCanvasMagnification = canvas.clientWidth / canvas.width;

    const imgData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

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
    return { textureCoordinates, textureColors, textCanvasMagnification };
  };

  createInstancedMesh = (
    textureCoordinates: {
      x: number;
      y: number;
      z: number;
    }[],
    textureColors: { r: number; g: number; b: number }[],
    textCanvasMagnification: number
  ) => {
    const obj = new THREE.Object3D();
    const particleGeometry = new THREE.IcosahedronGeometry(0.5, 0);

    const instancedMesh = new THREE.InstancedMesh(
      particleGeometry,
      this.particleMaterial,
      textureCoordinates.length
    );
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
    for (let i = 0; i < textureCoordinates.length; i++) {
      const position = {
        x: textureCoordinates[i].x - this.textCanvas.width * 0.5,
        y: textureCoordinates[i].y + this.textCanvas.height * 0.5,
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
    return instancedMesh;
  };

  createShaderMaterials = () => {
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
    const pictureFrameMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0.0,
        },
        uProgress: {
          value: PARAMS.progress,
        },
        uTexture: { value: this.rendererOffscreen.texture },
      },
      vertexShader: TextureVertexShader,
      fragmentShader: TextureFragmentShader,
      transparent: true,
    });
    return { particleMaterial, pictureFrameMaterial };
  };

  createPictureFrame = () => {
    const pictureFrameGroup = new THREE.Group();

    const pictureFramePaperGeometry = new THREE.PlaneGeometry(200, 200);
    const pictureFramePaper = new THREE.Mesh(
      pictureFramePaperGeometry,
      this.pictureFramePaperMaterial
    );
    pictureFramePaper.position.setZ(-2);
    pictureFrameGroup.add(pictureFramePaper);

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
    pictureFrameGroup.add(pictureFrameBack);

    const pictureFrameGeometry = new THREE.BoxGeometry(210, 5, 4);
    const pictureFrameMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
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

    return pictureFrameGroup;
  };

  registerEvents = () => {
    window.addEventListener('resize', this.onResize);
  };

  removeEvents = () => {
    window.removeEventListener('resize', this.onResize);
  };
}

export const webGLAppInit = async ({
  canvas,
  textCanvas,
}: {
  canvas: HTMLCanvasElement;
  textCanvas: HTMLCanvasElement;
}) => {
  const texture = await loadTexture(Wood);
  return new WebGLApp({ canvas, textCanvas, texture });
};
