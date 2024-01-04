import 'destyle.css';
import '../css/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Pane } from 'tweakpane';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import Mesh_Elephant from '../obj/Mesh_Elephant.obj?url';
import Mesh_Orca from '../obj/Mesh_Orca.obj?url';
import Mesh_Rabbit from '../obj/Mesh_Rabbit.obj?url';
// import { gsap } from 'gsap';

const animalChangeTrigger =
  document.querySelector<HTMLButtonElement>('#button')!;

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

const loadObj = async <T extends THREE.Group<THREE.Object3DEventMap>>(
  url: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    new OBJLoader().load(
      url,
      obj => {
        const group = obj as T;
        resolve(group);
      },
      xhr => console.log(url, (xhr.loaded / xhr.total) * 100 + '% loaded'),
      err => {
        console.error(err);
        reject(err);
      }
    );
  });
};

const init = async () => {
  const pane = new Pane();
  const PARAMS = {
    _duration: 1.0,
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
  const sceneRTT = new THREE.Scene();

  const fov = 60;
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const cameraRTT = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  cameraRTT.position.set(250, 250, 250);
  cameraRTT.lookAt(sceneRTT.position);
  cameraRTT.aspect = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);

  const group = new THREE.Group();
  sceneRTT.add(group);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const scale = 1.0;
  const animalObjects = await Promise.all([
    loadObj(Mesh_Elephant),
    loadObj(Mesh_Orca),
    loadObj(Mesh_Rabbit),
  ]);

  let activeAnimalIndex = 0;
  let activeAnimal = animalObjects[activeAnimalIndex];
  const animal = activeAnimal.children[0] as THREE.Mesh;
  const objMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.0,
  });
  animal.material = objMaterial;
  animal.scale.set(scale, scale, scale);

  const sampler = new MeshSurfaceSampler(animal).build();

  const sparklesGeometry = new THREE.BufferGeometry();
  const sparklesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uDuration: { value: PARAMS._duration },
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    transparent: true,
  });

  let points = new THREE.Points(sparklesGeometry, sparklesMaterial);
  group.add(points);

  const tempPosition = new THREE.Vector3();
  const tempSparklesArray: number[] = [];

  for (let i = 0; i < 10000; i++) {
    sampler.sample(tempPosition);
    tempSparklesArray[i * 3] = tempPosition.x * scale;
    tempSparklesArray[i * 3 + 1] = tempPosition.y * scale;
    tempSparklesArray[i * 3 + 2] = tempPosition.z * scale;
  }

  sparklesGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(tempSparklesArray, 3)
  );

  animalChangeTrigger.addEventListener('click', () => {
    group.remove(points);

    activeAnimalIndex = (activeAnimalIndex + 1) % animalObjects.length;
    activeAnimal = animalObjects[activeAnimalIndex];
    const nextAnimalMesh = activeAnimal.children[0] as THREE.Mesh;
    nextAnimalMesh.material = objMaterial;
    const scale = activeAnimalIndex === 2 ? 15.0 : 1.0;
    nextAnimalMesh.scale.set(scale, scale, scale);

    const sampler = new MeshSurfaceSampler(nextAnimalMesh).build();

    const tempPosition = new THREE.Vector3();
    const tempSparklesArray: number[] = [];

    for (let i = 0; i < 10000; i++) {
      sampler.sample(tempPosition);
      tempSparklesArray[i * 3] = tempPosition.x * scale;
      tempSparklesArray[i * 3 + 1] = tempPosition.y * scale;
      tempSparklesArray[i * 3 + 2] = tempPosition.z * scale;
    }
    const sparklesGeometry = new THREE.BufferGeometry();
    sparklesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(tempSparklesArray, 3)
    );
    const sparklesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uDuration: { value: PARAMS._duration },
      },
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      transparent: true,
    });
    points = new THREE.Points(sparklesGeometry, sparklesMaterial);
    group.add(points);
  });

  //レンダーターゲットオブジェクト
  const renderTarget = new THREE.WebGLRenderTarget(1024, 1024);

  //スクリーン用の平面
  const planeGeometry = new THREE.PlaneGeometry(4, 4, 2, 2);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: renderTarget.texture },
    },
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  const onResize = () => {
    const { width, height } = getWindow();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    cameraRTT.aspect = 1;
    cameraRTT.updateProjectionMatrix();
  };
  onResize();
  window.addEventListener('resize', onResize);

  const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;
    points.material.uniforms.uTime.value = elapsedTime;
    points.material.uniforms.uDuration.value = PARAMS._duration;

    //オフスクリーンレンダリング
    renderer.setClearColor(0x000000, 1.0);
    renderer.setRenderTarget(renderTarget);
    renderer.render(sceneRTT, cameraRTT);
    renderer.setRenderTarget(null);

    //レンダリング
    renderer.setClearColor(0xffffff, 1.0);
    renderer.render(scene, camera);

    controls.update();
  };
  loop();
};

init();
