import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

// import { gsap } from 'gsap';
import { sketchInit } from './textCanvas';
import { getElement } from './utils';
import { webglInit } from './webglCanvas';

sketchInit();
setTimeout(() => {
  webglInit({
    textCanvas: getElement<HTMLCanvasElement>('#p5js-canvas > canvas')!,
  });
}, 500);
