import { IMG_INPUT_LIST } from './const';
import { map } from './math';

const getRandomChar = (text: string) => {
  return text.charAt(Math.floor(Math.random() * text.length));
};
const loadImg = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = err => {
      reject(err);
    };
  });
};
const getImagePixel = (image: HTMLImageElement, x: number, y: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  let ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(image, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    ctx = null;
    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  } else {
    return { r: 0, g: 0, b: 0 };
  }
};

export const textCanvasInit = async (
  canvas: HTMLCanvasElement,
  animal: number
) => {
  const { text: inputText, img: inputImg } = IMG_INPUT_LIST[animal];
  const fontSizeMax = 24;
  const fontSizeMin = 8;
  const spacing = 4;
  const kerning = 0.8;

  canvas.width = 400;
  canvas.height = 400;
  canvas.style.width = '200px';
  canvas.style.height = '200px';

  const img = await loadImg(inputImg);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ctx is null');
  }

  ctx.font = '20px serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();

  let x = 0;
  let y = 0;
  while (y < canvas.height) {
    const imgX = Math.round(map(x, 0, canvas.width, 0, img.width));
    const imgY = Math.round(map(y, 0, canvas.height, 0, img.height));
    const pixel = getImagePixel(img, imgX, imgY);
    const greyscale = Math.round(
      pixel.r * 0.222 + pixel.g * 0.707 + pixel.b * 0.071
    );

    ctx.save();
    ctx.translate(x, y);

    const fontSize = map(greyscale, 0, 255, fontSizeMax, fontSizeMin);
    ctx.font = fontSize * 2 + 'px serif';
    ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;

    const letter = getRandomChar(inputText);
    ctx.fillText(letter, 0, 0);
    const letterWidth = ctx.measureText(letter).width + kerning * 2;
    x += letterWidth;

    ctx.restore();

    if (x + letterWidth >= canvas.width + 16) {
      x = 0;
      y += spacing * 2;
    }
  }
  return { canvas, ctx, imgPath: inputImg };
};
