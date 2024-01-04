import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export const loadObj = async <T extends THREE.Group<THREE.Object3DEventMap>>(
  url: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    new OBJLoader().load(
      url,
      obj => {
        const group = obj as T;
        resolve(group);
      },
      xhr => console.log(url, (xhr.loaded / xhr.total) * 100 + '% loaded'),
      err => {
        console.error(err);
        reject(err);
      }
    );
  });
};
