import { getStore, initDB } from './utils.db';

import { STORE_NAMES } from '../constants/config';

export const getAllProducts = async () => {
  const store = await getStore(STORE_NAMES.PRODUCTS);
  return store.getAll();
};

export const getProductById = async (id) => {
  const store = await getStore(STORE_NAMES.PRODUCTS);
  return store.get(id);
};

export const saveProduct = async (product) => {
  const store = await getStore(STORE_NAMES.PRODUCTS, 'readwrite');

  // Create a clean product object with only the fields we want to store
  const productData = {
    name: product.name,
    cookedWeight: Number(product.cookedWeight) || 0,
  };

  if (product.id) {
    // For updates, include the ID
    await store.put({ ...productData, id: product.id });
    return { ...productData, id: product.id };
  } else {
    // For new products, let IndexedDB generate the ID
    const id = await store.add(productData);
    return { ...productData, id };
  }
};

export const deleteProduct = async (id) => {
  const db = await initDB();
  const tx = db.transaction(
    [STORE_NAMES.PRODUCTS, STORE_NAMES.PRODUCT_INGREDIENTS],
    'readwrite'
  );

  // Delete product ingredients first
  const ingredientsStore = tx.objectStore(STORE_NAMES.PRODUCT_INGREDIENTS);
  const ingredients = await ingredientsStore.index('productId').getAll(id);
  await Promise.all(ingredients.map((ing) => ingredientsStore.delete(ing.id)));

  // Then delete the product
  const store = tx.objectStore(STORE_NAMES.PRODUCTS);
  await store.delete(id);

  await tx.done;
};

// Product Ingredients CRUD operations
export const getProductIngredients = async (productId) => {
  const store = await getStore(STORE_NAMES.PRODUCT_INGREDIENTS);
  // Use the productId index to get all ingredients for this product
  return store.index('productId').getAll(IDBKeyRange.only(Number(productId)));
};

export const saveProductIngredient = async (productId, ingredient) => {
  const store = await getStore(STORE_NAMES.PRODUCT_INGREDIENTS, 'readwrite');

  try {
    // Create a clean ingredient object with only the fields we want to store
    const ingredientData = {
      productId: Number(productId),
      ingredientId: Number(ingredient.ingredientId),
      quantity: Number(ingredient.quantity) || 0,
    };

    if (ingredient.id) {
      // For updates, include the ID
      await store.put({ ...ingredientData, id: ingredient.id });
      return { ...ingredientData, id: ingredient.id };
    } else {
      // For new ingredients, let IndexedDB generate the ID
      const id = await store.add(ingredientData);
      return { ...ingredientData, id };
    }
  } catch (error) {
    console.error('Error saving product ingredient:', error);
    console.error('Ingredient data:', {
      productId,
      ingredient,
      parsedIngredient: {
        productId: Number(productId),
        ingredientId: Number(ingredient.ingredientId),
        quantity: Number(ingredient.quantity) || 0,
      },
    });
    throw error; // Re-throw to be caught by the caller
  }
};

export const deleteProductIngredient = async (id) => {
  const store = await getStore(STORE_NAMES.PRODUCT_INGREDIENTS, 'readwrite');
  await store.delete(id);
};
