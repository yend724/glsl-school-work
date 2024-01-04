import 'destyle.css';
import '../css/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import FragmentShader from '../shader/fragment.frag?raw';
import VertexShader from '../shader/vertex.vert?raw';
import Mesh_Elephant from '../obj/Mesh_Elephant.obj?url';
import Mesh_Orca from '../obj/Mesh_Orca.obj?url';
import Mesh_Penguin from '../obj/Mesh_Penguin.obj?url';
import { getWindow, getCanvas, getElements } from './utils';
import { loadObj } from './webgl';
import { gsap } from 'gsap';

const animalChangeTriggers = getElements<HTMLButtonElement>(
  'button[data-animal-change-dir'
);

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
  const sceneOffscreen = new THREE.Scene();

  const fov = 60;
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const cameraOffscreen = new THREE.PerspectiveCamera(
    fov,
    width / height,
    0.1,
    1000
  );
  cameraOffscreen.position.set(100, 200, 300);
  cameraOffscreen.lookAt(sceneOffscreen.position);
  cameraOffscreen.aspect = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  //レンダーターゲットオブジェクト
  const renderTarget = new THREE.WebGLRenderTarget(1024, 1024);

  //スクリーン用の平面
  const planeGeometry = new THREE.PlaneGeometry(4, 4, 2, 2);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture1: { value: renderTarget.texture },
      uTime: { value: 0.0 },
      uDuration: { value: PARAMS._duration },
    },
    fragmentShader: `
        uniform float uDuration;
        uniform sampler2D uTexture1;
        uniform sampler2D uTexture2;
        varying vec2 vUv;
        varying vec3 vPosition;

        float amplitude = 30.0;
        float speed = 10.0;

        vec4 getFromColor(vec2 uv){
          return texture2D(uTexture1, uv);
        }
        vec4 getToColor(vec2 uv){
          return texture2D(uTexture1, uv);
        }

        void main() {
          float progress = uDuration;
          vec2 dir = vUv - vec2(.5);
          float dist = length(dir);

          vec2 p = vUv;

          if (dist > progress) {
            gl_FragColor = mix(getFromColor(p), getToColor(p), progress);
          } else {
            vec2 offset = dir * sin(dist * amplitude - progress * speed);
            gl_FragColor = mix(getFromColor(p + offset), getToColor(p), progress);
          }
        }
      `,
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  const group = new THREE.Group();
  sceneOffscreen.add(group);

  const animalScales = [1.0, 0.6, 1.2];
  const animalObjects = await Promise.all([
    loadObj(Mesh_Elephant),
    loadObj(Mesh_Orca),
    loadObj(Mesh_Penguin),
  ]).then(objects => {
    return objects.map((object, i) => ({
      object,
      scale: animalScales[i],
    }));
  });

  let activeAnimalIndex = 0;
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

  const nextIndex = (index: number, dir: 'next' | 'prev') => {
    if (dir === 'next') {
      return (index + 1) % animalObjects.length;
    }
    return index === 0 ? animalObjects.length - 1 : index - 1;
  };

  let points = new THREE.Points(sparklesGeometry, sparklesMaterial);
  const addSparkles = ({
    dir = 'current',
  }: {
    dir: 'next' | 'prev' | 'current';
  }) => {
    group.remove(points);
    activeAnimalIndex =
      dir === 'current' ? activeAnimalIndex : nextIndex(activeAnimalIndex, dir);
    const activeAnimal = animalObjects[activeAnimalIndex];
    const nextAnimalMesh = activeAnimal.object.children[0] as THREE.Mesh;
    const objMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
    });
    nextAnimalMesh.material = objMaterial;
    const scale = activeAnimal.scale;
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

    sparklesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(tempSparklesArray, 3)
    );
    points = new THREE.Points(sparklesGeometry, sparklesMaterial);
    group.add(points);
  };
  addSparkles({
    dir: 'current',
  });
  animalChangeTriggers.forEach(trigger => {
    const dir = (trigger.dataset.animalChangeDir as 'next' | 'prev') ?? 'next';
    trigger.addEventListener('click', () => {
      gsap.to(PARAMS, {
        _duration: 1.0,
        duration: 1.0,
        onComplete: () => {
          addSparkles({
            dir,
          });
          gsap.to(PARAMS, {
            _duration: 0.0,
            duration: 1.0,
          });
        },
      });
    });
  });

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

  const startTime = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    const elapsedTime = performance.now() - startTime;
    points.material.uniforms.uTime.value = elapsedTime;
    points.material.uniforms.uDuration.value = PARAMS._duration;

    points.rotation.y += 0.001;

    plane.material.uniforms.uTime.value = elapsedTime;
    plane.material.uniforms.uDuration.value = PARAMS._duration;

    //オフスクリーンレンダリング
    renderer.setClearColor(0x000000, 1.0);
    renderer.setRenderTarget(renderTarget);
    renderer.render(sceneOffscreen, cameraOffscreen);
    renderer.setRenderTarget(null);

    //レンダリング
    renderer.setClearColor(0x222222, 1.0);
    renderer.render(scene, camera);

    controls.update();
  };
  loop();
};

init();
