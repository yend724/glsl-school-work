import 'destyle.css';
import '/assets/css/common.css';
import '../css/style.css';

import { sketchInit } from './textCanvas';
import { webglInit } from './webglCanvas';
import { createCanvas } from './utils';

const buttons = document.querySelectorAll<HTMLButtonElement>(
  '[data-slide-trigger]'
);
const canvas = createCanvas('webgl');
let events = () => {};
const init = async (animal: number = 0) => {
  const textCanvas = await sketchInit({
    animal,
  });
  const { onResize } = await webglInit({
    canvas,
    textCanvas: textCanvas,
  });
  textCanvas.remove();
  events = onResize;
};

init(0);
let count = 0;
const getNextCount = (count: number, dir: string) => {
  let result = count + 1;
  if (dir === 'next') {
    result = (count + 1) % 6;
  } else {
    result = count === 0 ? 5 : count - 1;
  }
  return result;
};
Array.from(buttons).forEach(element => {
  element.addEventListener('click', async () => {
    const dir = element.dataset.slideTrigger ?? 'next';
    const nextCount = getNextCount(count, dir);
    window.removeEventListener('resize', events);
    init(nextCount);
    count = nextCount;
  });
});
