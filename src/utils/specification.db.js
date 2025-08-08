import { getStore, initDB } from './utils.db';

import { STORE_NAMES } from '../constants/config';
import { specifications } from '../constants/config';

export const getAllSpecifications = async () => {
  const store = await getStore(STORE_NAMES.SPECIFICATIONS);
  let specs = await store.getAll();

  if (specs.length !== 0) {
    return specs
      .map((spec) => ({
        ...spec,
        order: spec.order ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => a.order - b.order);
  }

  // Save default specs
  const tx = (await initDB()).transaction(
    STORE_NAMES.SPECIFICATIONS,
    'readwrite'
  );
  const specStore = tx.objectStore(STORE_NAMES.SPECIFICATIONS);
  await Promise.all(specifications.map((col) => specStore.put(col)));

  return specifications;
};

export const saveSpecification = async (specification) => {
  const store = await getStore(STORE_NAMES.SPECIFICATIONS, 'readwrite');
  await store.put(specification);
  return specification;
};

export const addNewSpecification = async (specification) => {
  const store = await getStore(STORE_NAMES.SPECIFICATIONS, 'readwrite');
  const id = `spec_${Date.now()}`;
  const order = await store.count();
  const newSpecification = { ...specification, id, order };
  await store.add(newSpecification);
  return newSpecification;
};
