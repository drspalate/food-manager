import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  deleteMenu,
  deleteMenuItem,
  getAllMenus,
  getMenuItems,
  saveMenu,
  saveMenuItem,
} from '../../utils/menu.db';
import { getAllProducts, getProductIngredients } from '../../utils/product.db';

import { AddMenu } from './add-menu';
import { ProductDetails } from './product-details';
import { getAllIngredients } from '../../utils/ingredient.db';
import { getAllSpecifications } from '../../utils/specification.db';

const MenuTable = () => {
  const [menus, setMenus] = useState([]);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [menuItems, setMenuItems] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [productIngredients, setProductIngredients] = useState({});
  const [formState, setFormState] = useState({
    name: '',
    items: [{ productId: '', quantity: 1 }],
  });

  // Load all necessary data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all base data in parallel
      const [menusData, productsData, ingredientsData, specsData] =
        await Promise.all([
          getAllMenus(),
          getAllProducts(),
          getAllIngredients(),
          getAllSpecifications(),
        ]);

      setMenus(menusData);
      setProducts(productsData);
      setIngredients(ingredientsData);
      setSpecifications(specsData);

      // Load all menu items for all menus
      const menuItemsMap = {};
      const allMenuItems = await Promise.all(
        menusData.map(menu => getMenuItems(menu.id))
      );

      // Create menu items map
      menusData.forEach((menu, index) => {
        menuItemsMap[menu.id] = allMenuItems[index] || [];
      });
      setMenuItems(menuItemsMap);

      // Get all unique product IDs from all menu items
      const allProductIds = new Set();
      Object.values(menuItemsMap).forEach(items => {
        items.forEach(item => {
          if (item.productId) {
            allProductIds.add(item.productId);
          }
        });
      });

      // Load all product ingredients in parallel
      await Promise.all(
        Array.from(allProductIds).map(productId => 
          loadProductIngredients(productId)
        )
      );
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadProductIngredients = async (productId) => {
    if (!productId) {
      console.error('No productId provided to loadProductIngredients');
      return [];
    }

    try {
      const [productIngs, allIngredients] = await Promise.all([
        getProductIngredients(productId),
        getAllIngredients(),
      ]);

      if (!productIngs || !productIngs.length) {
        console.warn('No ingredients found for product:', productId);
        return [];
      }

      // Map product ingredients with their full details
      const ingredientsWithDetails = productIngs
        .map((ing) => {
          const fullIngredient = allIngredients.find(
            (i) => i.id === ing.ingredientId
          );
          return fullIngredient
            ? { ...ing, ingredientDetails: fullIngredient }
            : null;
        })
        .filter(Boolean); // Remove any null entries

      // Update state with the new data
      setProductIngredients((prev) => ({
        ...prev,
        [productId]: ingredientsWithDetails,
      }));

      return ingredientsWithDetails;
    } catch (error) {
      console.error('Error in loadProductIngredients:', error);
      return [];
    }
  };

  const handleExpandRow = (menuId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleOpenDialog = () => {
    setFormState({
      name: '',
      count: 1, // Default count to 1
      items: [{ productId: '', quantity: 1 }],
    });
    setEditingMenu(null);
    setOpenDialog(true);
  };

  const handleEditMenu = async (menu) => {
    try {
      const items = await getMenuItems(menu.id);
      setFormState({
        name: menu.name,
        count: menu.count || 1, // Load existing count or default to 1
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        })) || [{ productId: '', quantity: 1 }],
      });
      setEditingMenu(menu);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error loading menu for editing:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMenuItemChange = (index, field, value) => {
    const newItems = [...formState.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormState((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addMenuItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }],
    }));
  };

  const removeMenuItem = (index) => {
    const newItems = formState.items.filter((_, i) => i !== index);
    setFormState((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save the menu
      const menuData = {
        id: editingMenu?.id,
        name: formState.name,
        count: parseInt(formState.count) || 1, // Save count, default to 1 if not provided
      };
      const savedMenu = await saveMenu(menuData);

      // If editing, first remove any items that were deleted
      if (editingMenu) {
        const existingItems = await getMenuItems(editingMenu.id);
        const newItemIds = new Set(
          formState.items.map((item) => item.id).filter(Boolean)
        );

        // Find items to delete
        const itemsToDelete = existingItems.filter(
          (item) => !newItemIds.has(item.id)
        );
        await Promise.all(itemsToDelete.map((item) => deleteMenuItem(item.id)));
      }

      // Save or update menu items
      const savedItems = [];
      for (const item of formState.items) {
        if (item.productId) {
          // Only include the id if it exists (for updates)
          const itemData = {
            ...(item.id && { id: item.id }), // Only include id if it exists
            menuId: savedMenu.id,
            productId: item.productId,
            quantity: item.quantity,
          };
          const savedItem = await saveMenuItem(itemData);
          savedItems.push(savedItem);
        }
      }

      // Update state
      if (editingMenu) {
        setMenus((prev) =>
          prev.map((m) =>
            m.id === savedMenu.id ? { ...savedMenu, items: savedItems } : m
          )
        );
      } else {
        setMenus((prev) => [...prev, { ...savedMenu, items: savedItems }]);
      }

      handleCloseDialog();
      loadData(); // Reload data to ensure consistency
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        // Delete all menu items first
        const items = await getMenuItems(id);
        await Promise.all(items.map((item) => deleteMenuItem(item.id)));

        // Then delete the menu
        await deleteMenu(id);
        setMenus((prev) => prev.filter((menu) => menu.id !== id));
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
  };

  // Function to calculate total cooked weight and nutritional values for a menu
  const calculateMenuTotals = (menu) => {
    const items = menuItems[menu.id] || [];
    const totals = {
      cookedWeight: 0,
      specs: {},
    };

    // Initialize specs from specifications
    specifications.forEach((spec) => {
      if (spec.id !== 'ingredient') {
        totals.specs[spec.id] = 0;
      }
    });

    // Calculate totals for each menu item
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      // Add cooked weight if available
      if (product.cookedWeight) {
        totals.cookedWeight += product.cookedWeight * item.quantity;
      }

      // Add nutritional values
      const productIngs = productIngredients[item.productId] || [];
      productIngs.forEach((ing) => {
        const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
        if (!ingredient) return;

        const quantityInGrams = ing.quantity * item.quantity;

        // Add each spec value
        Object.keys(totals.specs).forEach((specId) => {
          const specValue = parseFloat(ingredient[specId] || 0);
          totals.specs[specId] += (specValue * quantityInGrams) / 100;
        });
      });
    });

    return totals;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Menu
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Cooked Weight (g)</TableCell>
              {specifications
                .filter((spec) => spec.id !== 'ingredient')
                .map((spec) => (
                  <TableCell key={spec.id} align="right">
                    {spec.label}
                    {spec.unit ? ` (${spec.unit})` : ''}
                  </TableCell>
                ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menus.map((menu) => (
              <React.Fragment key={menu.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandRow(menu.id)}
                    >
                      {expandedRows[menu.id] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{menu.name}</TableCell>
                  <TableCell>{menu.count}</TableCell>
                  <TableCell>
                    {(() => {
                      const total = calculateMenuTotals(menu).cookedWeight;
                      return total > 0 ? `${total.toFixed(1)}g` : '-';
                    })()}
                  </TableCell>
                  {specifications
                    .filter((spec) => spec.id !== 'ingredient')
                    .map((spec) => {
                      const total =
                        calculateMenuTotals(menu).specs[spec.id] || 0;
                      return (
                        <TableCell key={spec.id} align="right">
                          {(total * menu.count).toFixed(1)}
                        </TableCell>
                      );
                    })}
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMenu(menu);
                      }}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenu(menu.id);
                      }}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ padding: 0 }} colSpan={20}>
                    <Collapse
                      in={expandedRows[menu.id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <ProductDetails
                        menu={menu}
                        menuItems={menuItems}
                        products={products}
                        ingredients={ingredients}
                        specifications={specifications}
                        productIngredients={productIngredients}
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddMenu
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
        editingMenu={editingMenu}
        formState={formState}
        handleInputChange={handleInputChange}
        handleMenuItemChange={handleMenuItemChange}
        addMenuItem={addMenuItem}
        removeMenuItem={removeMenuItem}
        products={products}
      />
    </Box>
  );
};

export default MenuTable;
