import {
  Add as AddIcon,
  Close as CloseIcon,
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
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
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
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  deleteProduct,
  deleteProductIngredient,
  getAllIngredients,
  getAllProducts,
  getAllSpecifications,
  getProductIngredients,
  saveProduct,
  saveProductIngredient,
} from '../../utils';

import { ProductIngredients } from './product-ingredients';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [formState, setFormState] = useState({
    name: '',
    cookedWeight: 100,
    ingredients: [{ ingredientId: '', quantity: 100 }],
  });

  // Load products, ingredients, and specifications
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ingredientsData, specsData] = await Promise.all([
        getAllProducts(),
        getAllIngredients(),
        getAllSpecifications(),
      ]);

      // Filter out the 'ingredient' specification as it's used as the first column
      const filteredSpecs = specsData.filter(
        (spec) => spec.id !== 'ingredient'
      );
      setSpecifications(filteredSpecs);

      // Load ingredients for each product
      const productsWithIngredients = await Promise.all(
        productsData.map(async (product) => {
          const ingredients = await getProductIngredients(product.id);
          return { ...product, ingredients };
        })
      );

      setProducts(productsWithIngredients);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleExpandRow = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAddIngredient = () => {
    setFormState((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: '', quantity: 100 }],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formState.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'quantity' ? Number(value) : value,
    };
    setFormState((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formState);

    try {
      // Save product
      const productData = {
        id: editingProduct?.id,
        name: formState.name,
        cookedWeight: Number(formState.cookedWeight),
      };
      console.log('Saving product:', productData);

      const savedProduct = await saveProduct(productData);
      console.log('Product saved:', savedProduct);

      // Get current ingredient IDs from the form
      const currentIngredientIds = formState.ingredients
        .map((ing) => ing.id)
        .filter(Boolean); // Remove undefined IDs (new ingredients)

      // Find ingredients that were removed (exist in editingProduct but not in formState)
      const removedIngredients =
        editingProduct?.ingredients?.filter(
          (ing) => !currentIngredientIds.includes(ing.id)
        ) || [];

      // Delete removed ingredients
      await Promise.all(
        removedIngredients.map(async (ingredient) => {
          console.log('Deleting removed ingredient:', ingredient);
          try {
            // Assuming there's a deleteProductIngredient API function
            await deleteProductIngredient(ingredient.id);
            console.log('Successfully deleted ingredient:', ingredient.id);
          } catch (error) {
            console.error('Error deleting ingredient:', ingredient.id, error);
            throw error;
          }
        })
      );

      // Save/update current ingredients
      console.log('Saving ingredients:', formState.ingredients);
      const savedIngredients = await Promise.all(
        formState.ingredients.map(async (ingredient, index) => {
          console.log(`Saving ingredient ${index + 1}:`, ingredient);
          try {
            const savedIngredient = await saveProductIngredient(
              savedProduct.id,
              {
                ...ingredient,
                id: ingredient.id || undefined,
              }
            );
            console.log(`Ingredient ${index + 1} saved:`, savedIngredient);
            return savedIngredient;
          } catch (ingError) {
            console.error(`Error saving ingredient ${index + 1}:`, ingError);
            throw ingError;
          }
        })
      );
      console.log('All ingredients processed:', savedIngredients);

      // Reload data
      console.log('Reloading data...');
      await loadData();
      console.log('Data reloaded');
      handleCloseDialog();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      cookedWeight: product.cookedWeight,
      ingredients: product.ingredients || [],
    });
    setOpenDialog(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormState({
      name: '',
      cookedWeight: 100,
      ingredients: [{ ingredientId: '', quantity: 100 }],
    });
  };

  // Calculate nutritional values for a product by summing up all ingredient values
  const calculateNutrition = (product) => {
    console.log('Calculating nutrition for product:', product);
    if (!product.ingredients?.length) {
      console.log('No ingredients found for product');
      return {};
    }

    // Calculate total nutrition by summing up all ingredients
    return product.ingredients.reduce((acc, item) => {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId);

      if (!ingredient) {
        return acc;
      }

      const ratio = item.quantity / 100; // Calculate ratio for the given quantity

      specifications.forEach((spec) => {
        if (ingredient[spec.id] !== undefined) {
          acc[spec.id] = (acc[spec.id] || 0) + ingredient[spec.id] * ratio;
        }
      });

      return acc;
    }, {});
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Cooked Weight (g)</TableCell>
              <TableCell align="right">Quantity (g)</TableCell>
              {specifications.map((spec) => (
                <TableCell key={spec.id} align="right">
                  {spec.label}
                  {spec.unit ? ` (${spec.unit})` : ''}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const nutrition = calculateNutrition(product);
              const isExpanded = expandedRows[product.id];

              return (
                <React.Fragment key={product.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandRow(product.id)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{product.cookedWeight}g</TableCell>
                    <TableCell align="right">
                      {product.ingredients.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}
                      g
                    </TableCell>
                    {specifications.map((spec) => (
                      <TableCell key={spec.id} align="right">
                        {nutrition[spec.id]?.toFixed(2) || '0.00'}
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(product)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(product.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={15}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{ p: 2, backgroundColor: 'background.default' }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Ingredients
                          </Typography>

                          <ProductIngredients
                            product={product}
                            ingredients={ingredients}
                            specifications={specifications}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
            >
              <TextField
                label="Product Name"
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                fullWidth
                margin="normal"
              />

              <TextField
                label="Cooked Weight (g)"
                type="number"
                value={formState.cookedWeight}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    cookedWeight: Math.max(0, e.target.value),
                  }))
                }
                required
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">g</InputAdornment>
                  ),
                }}
              />

              <Divider sx={{ my: 2 }}>Ingredients</Divider>

              {formState.ingredients.map((ingredient, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
                >
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Ingredient</InputLabel>
                    <Select
                      value={ingredient.ingredientId || ''}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          'ingredientId',
                          e.target.value
                        )
                      }
                      label="Ingredient"
                      required
                    >
                      {ingredients.map((ing) => (
                        <MenuItem key={ing.id} value={ing.id}>
                          {ing.ingredient}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantity"
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, 'quantity', e.target.value)
                    }
                    required
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">g</InputAdornment>
                      ),
                    }}
                    sx={{ width: 150 }}
                  />

                  {formState.ingredients.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveIngredient(index)}
                      color="error"
                      sx={{ mt: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                onClick={handleAddIngredient}
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 1, alignSelf: 'flex-start' }}
              >
                Add Ingredient
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductsTable;
