import { Pane } from 'tweakpane';
import { getQueryParameters } from './url';
const query = getQueryParameters();
import { IMG_INPUT_LIST } from './const';

const PARAMS = {
  progress: 0.0,
  activeAnimalIndex: query.animal ? Number(query.animal) : 0,
};

export const parameterInit = () => {
  const pane = new Pane();
  const options = IMG_INPUT_LIST.map((item, index) => {
    return {
      text: item.text,
      value: index,
    };
  });
  pane.addBinding(PARAMS, 'progress', {
    slider: true,
    min: 0,
    max: 1,
    label: 'progress',
  });
  pane.addBinding(PARAMS, 'activeAnimalIndex', {
    label: 'animal',
    options,
    value: 0,
  });
  // pane.dispose();

  return { pane, PARAMS };
};
