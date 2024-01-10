export const getWindow = () => {
  const win = window;
  return {
    window: win,
    width: win.innerWidth,
    height: win.innerHeight,
  };
};
export const createCanvas = (id: string) => {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  document.body.appendChild(canvas);
  return canvas;
};
export const getElements = <T extends HTMLElement>(selector: string) => {
  const elements = document.querySelectorAll<T>(selector);
  return Array.from(elements);
};
