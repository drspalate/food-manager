import { STORE_NAMES } from '../constants/config';
import { getStore } from './utils.db';

export const getAllMenus = async () => {
  const store = await getStore(STORE_NAMES.MENUS);
  return store.getAll();
};

export const getMenu = async (id) => {
  const store = await getStore(STORE_NAMES.MENUS);
  return store.get(id);
};

export const saveMenu = async (menu) => {
  const store = await getStore(STORE_NAMES.MENUS, 'readwrite');
  
  // Create a clean menu object with only the fields we want to save
  const menuToSave = {
    name: menu.name,
    count: parseInt(menu.count) || 1, // Ensure count is a number, default to 1
    ...(menu.id && { id: menu.id }) // Only include id if it exists
  };

  if (menu.id) {
    await store.put(menuToSave);
    return menuToSave;
  } else {
    const id = await store.add(menuToSave);
    return { ...menuToSave, id };
  }
};

export const deleteMenu = async (id) => {
  const store = await getStore(STORE_NAMES.MENUS, 'readwrite');
  await store.delete(id);
};

export const getMenuItems = async (menuId) => {
  const store = await getStore(STORE_NAMES.MENU_ITEMS);
  return store.index('menuId').getAll(menuId);
};

export const saveMenuItem = async (menuItem) => {
  const store = await getStore(STORE_NAMES.MENU_ITEMS, 'readwrite');
  if (menuItem.id) {
    await store.put(menuItem);
    return menuItem;
  } else {
    const id = await store.add(menuItem);
    return { ...menuItem, id };
  }
};

export const deleteMenuItem = async (id) => {
  const store = await getStore(STORE_NAMES.MENU_ITEMS, 'readwrite');
  await store.delete(id);
};
