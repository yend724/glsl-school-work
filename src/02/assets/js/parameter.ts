import { Pane } from 'tweakpane';
import { getQueryParameters } from './url';
const query = getQueryParameters();
import { inputList } from './textCanvas';

const PARAMS = {
  progress: 0.0,
  activeAnimalIndex: query.animal ? Number(query.animal) : 0,
};

export const parameterInit = () => {
  const pane = new Pane();
  const options = inputList.map((item, index) => {
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

  return { pane, PARAMS };
};
