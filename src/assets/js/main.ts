import 'destyle.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import Mesh_Elephant from '../obj/Mesh_Elephant.obj?url';

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
  const { width, height } = getWindow();
  const canvas = getCanvas();

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  const scene = new THREE.Scene();

  const fov = 60;

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(100, 100, 100);

  const controls = new OrbitControls(camera, renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const scale = 0.5;
  const obj = await loadObj(Mesh_Elephant);
  const elephant = obj.children[0] as THREE.Mesh;
  elephant.material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.5,
  });
  elephant.scale.set(scale, scale, scale);
  group.add(obj);

  const sampler = new MeshSurfaceSampler(elephant).build();

  const sparklesGeometry = new THREE.BufferGeometry();
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
  for (let i = 0; i < 10000; i++) {
    // Sample a random point on the surface of the cube
    sampler.sample(tempPosition);
    tempSparklesArray[i * 3] = tempPosition.x * scale;
    tempSparklesArray[i * 3 + 1] = tempPosition.y * scale;
    tempSparklesArray[i * 3 + 2] = tempPosition.z * scale;
  }

  sparklesGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(tempSparklesArray, 3)
  );

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
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;
    points.material.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
  };
  loop();
};

init();
