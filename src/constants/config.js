export const DB_NAME = 'food-management-db';
export const DB_VERSION = 4; // Added count field to menus

export const STORE_NAMES = {
  SPECIFICATIONS: 'specifications',
  INGREDIENTS: 'ingredients',
  PRODUCTS: 'products',
  PRODUCT_INGREDIENTS: 'productIngredients',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
};

export const specifications = [
  { id: 'ingredient', label: 'Ingredient', order: 0 },
  {
    id: 'calorie',
    label: 'Calorie',
    type: 'number',
    order: 1,
  },
  {
    id: 'protein',
    label: 'Protein (g)',
    type: 'number',
    order: 2,
  },
  {
    id: 'cost',
    label: 'Cost (₹)',
    type: 'number',
  },
];
