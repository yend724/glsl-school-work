import p5 from 'p5';
import Eagle from '../img/eagle.png';
import Dog from '../img/dog.png';
import Zebra from '../img/zebra.png';
import RedPanda from '../img/red-panda.png';
import Penguin from '../img/penguin.png';
import Panda from '../img/panda.png';
import { getQueryParameters } from './url';

const canvasDrawCompleted = new CustomEvent('canvas-draw-complete');
export const inputList = [
  {
    text: 'Eagle',
    img: Eagle,
  },
  {
    text: 'Dog',
    img: Dog,
  },
  {
    text: 'Zebra',
    img: Zebra,
  },
  {
    text: 'Red Panda',
    img: RedPanda,
  },
  {
    text: 'Penguin',
    img: Penguin,
  },
  {
    text: 'Panda',
    img: Panda,
  },
];

const getRandomChar = (text: string) => {
  return text.charAt(Math.floor(Math.random() * text.length));
};
const sketch = (p: p5) => {
  const query = getQueryParameters();
  const activeAnimalIndex = query.animal ? Number(query.animal) : 0;
  const { text: inputText, img: inputImg } = inputList[activeAnimalIndex];
  const fontSizeMax = 24;
  const fontSizeMin = 8;
  const spacing = 4; // line height
  const kerning = 0.5; // between letters

  let img: p5.Image;

  p.preload = () => {
    img = p.loadImage(inputImg);
  };

  p.setup = () => {
    const canvas = p.createCanvas(200, 200);
    canvas.elt.getContext('2d', { willReadFrequently: true });
    canvas.parent('p5js-canvas');

    p.textFont('Times');
    p.textSize(10);
    p.textAlign(p.LEFT, p.CENTER);
  };

  p.draw = () => {
    p.background(255);

    let x = 0;
    let y = 0;

    while (y < p.height) {
      const imgX = p.round(p.map(x, 0, p.width, 0, img.width));
      const imgY = p.round(p.map(y, 0, p.height, 0, img.height));
      const c = p.color(img.get(imgX, imgY));
      const greyscale = p.round(
        p.red(c) * 0.222 + p.green(c) * 0.707 + p.blue(c) * 0.071
      );

      p.push();
      p.translate(x, y);

      const fontSize = p.map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
      p.textSize(fontSize);
      p.fill(c);

      const letter = getRandomChar(inputText);
      p.text(letter, 0, 0);
      const letterWidth = p.textWidth(letter) + kerning;
      x += letterWidth;

      p.pop();

      if (x + letterWidth >= p.width + 16) {
        x = 0;
        y += spacing;
      }
    }
    window.dispatchEvent(canvasDrawCompleted);
    p.noLoop();
  };
};

export const sketchInit = (): Promise<HTMLCanvasElement> => {
  return new Promise(resolve => {
    const p = new p5(sketch);
    window.addEventListener('canvas-draw-complete', () => {
      resolve(p.drawingContext.canvas);
    });
  });
};
