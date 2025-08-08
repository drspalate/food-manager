import { initDB } from './utils.db';

initDB().catch(console.error);

export * from './ingredient.db';
export * from './product.db';
export * from './specification.db';
