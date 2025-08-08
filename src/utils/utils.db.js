import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants/config';

import { openDB } from 'idb';

// Initialize the database with all stores
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    async upgrade(db) {
      // Create food items store
      if (!db.objectStoreNames.contains(STORE_NAMES.INGREDIENTS)) {
        const store = db.createObjectStore(STORE_NAMES.INGREDIENTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('id', 'id', { unique: true });
      }

      // Columns store is now managed in specs.db.js
      if (!db.objectStoreNames.contains(STORE_NAMES.SPECIFICATIONS)) {
        const store = db.createObjectStore(STORE_NAMES.SPECIFICATIONS, {
          keyPath: 'id',
        });
        store.createIndex('id', 'id', { unique: true });
      }

      // Create products store
      if (!db.objectStoreNames.contains(STORE_NAMES.PRODUCTS)) {
        const store = db.createObjectStore(STORE_NAMES.PRODUCTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: true });
      }

      // Create product ingredients store
      if (!db.objectStoreNames.contains(STORE_NAMES.PRODUCT_INGREDIENTS)) {
        const store = db.createObjectStore(STORE_NAMES.PRODUCT_INGREDIENTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('productId', 'productId', { unique: false });
        store.createIndex('ingredientId', 'ingredientId', { unique: false });
      }

      // Add menus and menu items stores
      if (!db.objectStoreNames.contains(STORE_NAMES.MENUS)) {
        const store = db.createObjectStore(STORE_NAMES.MENUS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: true });
      }

      // Create menu items store
      if (!db.objectStoreNames.contains(STORE_NAMES.MENU_ITEMS)) {
        const store = db.createObjectStore(STORE_NAMES.MENU_ITEMS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('menuId', 'menuId', { unique: false });
        store.createIndex('productId', 'productId', { unique: false });
      }

      // Add count field to menus
      if (!db.objectStoreNames.contains(STORE_NAMES.MENUS)) {
        const tx = db.transaction(STORE_NAMES.MENUS, 'readwrite');
        const store = tx.objectStore(STORE_NAMES.MENUS);
        const menus = await store.getAll();

        // Update each menu to include the count field
        await Promise.all(
          menus.map((menu) => {
            if (menu.count === undefined) {
              menu.count = 1; // Default count to 1 for existing menus
              return store.put(menu);
            }
            return Promise.resolve();
          })
        );
      }

      // Future migrations can be added here with increasing version numbers
    },
  });
  return db;
};

// Generic function to get a store for operations
export const getStore = async (storeName, mode = 'readonly') => {
  const db = await initDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};
