import { STORE_NAMES } from '../constants/config';
import { getStore } from './utils.db';

export const getAllIngredients = async () => {
  const store = await getStore(STORE_NAMES.INGREDIENTS);
  return store.getAll();
};

export const saveIngredient = async (item) => {
  const store = await getStore(STORE_NAMES.INGREDIENTS, 'readwrite');
  if (item.id) {
    await store.put(item);
    return item;
  } else {
    const id = await store.add(item);
    return { ...item, id };
  }
};

export const deleteIngredient = async (id) => {
  const store = await getStore(STORE_NAMES.INGREDIENTS, 'readwrite');
  await store.delete(id);
};
