export const getWindow = () => {
  const win = window;
  return {
    window: win,
    width: win.innerWidth,
    height: win.innerHeight,
  };
};
export const getCanvas = () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#webgl');
  if (canvas === null) {
    throw new Error('canvas is null');
  }
  return canvas;
};
export const removeCanvas = (id: string) => {
  const canvas = document.querySelector<HTMLCanvasElement>('#' + id);
  if (canvas === null) {
    throw new Error('canvas is null');
  }
  document.body.removeChild(canvas);
};
export const createCanvas = (id: string) => {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  document.body.appendChild(canvas);
  return canvas;
};
export const getElement = <T extends HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`${selector} is null`);
  }
  return element;
};
export const getElements = <T extends HTMLElement>(selector: string) => {
  const elements = document.querySelectorAll<T>(selector);
  return Array.from(elements);
};
