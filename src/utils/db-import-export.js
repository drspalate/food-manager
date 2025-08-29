import { STORE_NAMES } from '../constants/config';
import { getStore } from './utils.db';

// Export database to a JSON file
export const exportDatabase = async () => {
  try {
    // Get all data from all stores
    const dbData = {};
    
    // Get data from each store
    for (const storeName of Object.values(STORE_NAMES)) {
      try {
        const store = await getStore(storeName, 'readonly');
        dbData[storeName] = await store.getAll();
      } catch (error) {
        console.warn(`Error exporting store ${storeName}:`, error);
        dbData[storeName] = [];
      }
    }
    
    // Create a blob and download link
    const dataStr = JSON.stringify(dbData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
};

// Import database from a file
export const importDatabase = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const dbData = JSON.parse(event.target.result);
        
        // Clear existing data and import new data for each store
        for (const [storeName, items] of Object.entries(dbData)) {
          if (!Object.values(STORE_NAMES).includes(storeName)) continue;
          
          const store = await getStore(storeName, 'readwrite');
          
          // Clear existing data
          await store.clear();
          
          // Add new data
          if (Array.isArray(items)) {
            for (const item of items) {
              await store.add(item);
            }
          }
        }
        
        resolve(true);
      } catch (error) {
        console.error('Error importing database:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// Handle file selection for import
export const handleImportClick = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        await importDatabase(file);
        resolve(true);
      } catch (error) {
        reject(error);
      } finally {
        // Cleanup
        input.remove();
      }
    };
    
    // Trigger file selection dialog
    document.body.appendChild(input);
    input.click();
  });
};
