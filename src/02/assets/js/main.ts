import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

// import { gsap } from 'gsap';
import { sketchInit } from './textCanvas';
import { webglInit } from './webglCanvas';

const init = async () => {
  const textCanvas = await sketchInit();
  webglInit({
    textCanvas: textCanvas,
  });
};
init();
