import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

import { textCanvasInit } from './textCanvas';
import { webGLAppInit } from './webglCanvas';
import { createCanvas, getElements } from './utils';
import { IMG_INPUT_LIST } from './const';

const textCanvas = createCanvas('text-canvas');
document.body.appendChild(textCanvas);
const canvas = createCanvas('webgl');
document.body.appendChild(canvas);

const buttons = getElements<HTMLButtonElement>('[data-slider-trigger]');
let count = 0;
const getNextCount = (count: number, dir: string) => {
  let result = count;
  if (dir === 'next') {
    result = (count + 1) % IMG_INPUT_LIST.length;
  } else {
    result = count === 0 ? IMG_INPUT_LIST.length - 1 : count - 1;
  }
  return result;
};
const init = async (animal: number = 0) => {
  await textCanvasInit(textCanvas, animal);
  const app = await webGLAppInit({
    canvas,
    textCanvas,
  });

  Array.from(buttons).forEach(element => {
    element.addEventListener('click', async () => {
      buttons.forEach(button => {
        button.disabled = true;
      });

      const dir = element.dataset.sliderTrigger ?? 'next';
      const nextCount = getNextCount(count, dir);
      await textCanvasInit(textCanvas, nextCount);
      await app.changeTexture(textCanvas, nextCount);
      count = nextCount;

      buttons.forEach(button => {
        button.disabled = false;
      });
    });
  });
};
init(0);
