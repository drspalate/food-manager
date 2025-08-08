import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useMemo } from 'react';

export const ProductDetails = ({
  menu,
  menuItems,
  products,
  ingredients,
  specifications,
  productIngredients,
}) => {
  const [viewMode, setViewMode] = React.useState('individual');

  // Compute consolidated ingredients
  const consolidatedIngredients = useMemo(() => {
    if (viewMode !== 'consolidated') return [];

    const ingredientMap = new Map();

    menuItems[menu.id]?.forEach((item) => {
      const productIngs = productIngredients[item.productId] || [];

      productIngs.forEach((ing) => {
        const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
        if (!ingredient) return;

        const quantity = ing.quantity * item.quantity;
        const existing = ingredientMap.get(ing.ingredientId);

        if (existing) {
          // Add to existing ingredient quantities
          existing.quantity += quantity;
          specifications.forEach((spec) => {
            if (spec.id !== 'ingredient') {
              existing[spec.id] =
                (existing[spec.id] || 0) +
                ((ingredient[spec.id] || 0) * quantity) / 100;
            }
          });
        } else {
          // Add new ingredient entry
          const newIngredient = {
            ...ingredient,
            quantity,
            productIds: [item.productId],
          };

          // Initialize spec values
          specifications.forEach((spec) => {
            if (spec.id !== 'ingredient') {
              newIngredient[spec.id] =
                ((ingredient[spec.id] || 0) * quantity) / 100;
            }
          });

          ingredientMap.set(ing.ingredientId, newIngredient);
        }
      });
    });

    return Array.from(ingredientMap.values());
  }, [
    menu.id,
    menuItems,
    productIngredients,
    ingredients,
    specifications,
    viewMode,
  ]);

  const renderIndividualView = () =>
    menuItems[menu.id]?.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return (
        <React.Fragment key={item.id}>
          <TableRow>
            <TableCell>{product?.name || 'Unknown Product'}</TableCell>
            <TableCell>
              {item.quantity} {item.quantity === 1 ? 'serving' : 'servings'}
              <br />
              {product?.cookedWeight > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Cooked Weight:{' '}
                  {`${(product.cookedWeight * item.quantity).toFixed(1)}g`}
                </Typography>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} style={{ padding: 0 }}>
              <Box sx={{ margin: 1 }}>
                <Table size="small" sx={{ backgroundColor: '#f9f9f9' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell align="right">Qty (g)</TableCell>
                      {specifications
                        .filter((spec) => spec.id !== 'ingredient')
                        .map((spec) => (
                          <TableCell key={spec.id} align="right">
                            {spec.label}
                            {spec.unit ? ` (${spec.unit})` : ''}
                          </TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productIngredients[item.productId]?.map((ing, idx) => {
                      const ingredient = ingredients.find(
                        (i) => i.id === ing.ingredientId
                      );
                      if (!ingredient) return null;

                      const quantityInGrams = ing.quantity * item.quantity;
                      return (
                        <TableRow key={`${item.id}-${ing.id}-${idx}`}>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {ingredient.ingredient || 'Unknown'}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 'medium' }}
                          >
                            {quantityInGrams.toFixed(2)}g
                          </TableCell>
                          {specifications
                            .filter((spec) => spec.id !== 'ingredient')
                            .map((spec) => (
                              <TableCell key={spec.id} align="right">
                                {(
                                  ((ingredient[spec.id] || 0) *
                                    quantityInGrams) /
                                  100
                                ).toFixed(2)}
                              </TableCell>
                            ))}
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Total per serving
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {productIngredients[item.productId]
                          ?.reduce(
                            (sum, ing) => sum + ing.quantity * item.quantity,
                            0
                          )
                          .toFixed(2)}
                        g
                      </TableCell>
                      {specifications
                        .filter((spec) => spec.id !== 'ingredient')
                        .map((spec) => {
                          const total =
                            productIngredients[item.productId]?.reduce(
                              (sum, ing) => {
                                const ingredient = ingredients.find(
                                  (i) => i.id === ing.ingredientId
                                );
                                if (!ingredient) return sum;
                                const value = parseFloat(
                                  ingredient[spec.id] || 0
                                );
                                const quantityInGrams =
                                  ing.quantity * item.quantity;
                                return sum + (value * quantityInGrams) / 100;
                              },
                              0
                            ) || 0;

                          return (
                            <TableCell
                              key={`total-${spec.id}`}
                              align="right"
                              sx={{ fontWeight: 'bold' }}
                            >
                              {total.toFixed(2)}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    });

  const renderConsolidatedView = () => (
    <TableRow>
      <TableCell colSpan={2} style={{ padding: 0 }}>
        <Box sx={{ margin: 1 }}>
          <Table size="small" sx={{ backgroundColor: '#f9f9f9' }}>
            <TableHead>
              <TableRow>
                <TableCell>Ingredient</TableCell>
                <TableCell align="right">Total Qty (g)</TableCell>
                {specifications
                  .filter((spec) => spec.id !== 'ingredient')
                  .map((spec) => (
                    <TableCell key={spec.id} align="right">
                      {spec.label}
                      {spec.unit ? ` (${spec.unit})` : ''}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {consolidatedIngredients.map((ingredient, idx) => (
                <TableRow key={`consolidated-${ingredient.id}-${idx}`}>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {ingredient.ingredient || 'Unknown'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                    {ingredient.quantity.toFixed(2)}g
                  </TableCell>
                  {specifications
                    .filter((spec) => spec.id !== 'ingredient')
                    .map((spec) => (
                      <TableCell key={spec.id} align="right">
                        {ingredient[spec.id]?.toFixed(2) || '0.00'}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
              {consolidatedIngredients.length > 0 && (
                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grand Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {consolidatedIngredients
                      .reduce((sum, ing) => sum + (ing.quantity || 0), 0)
                      .toFixed(2)}
                    g
                  </TableCell>
                  {specifications
                    .filter((spec) => spec.id !== 'ingredient')
                    .map((spec) => {
                      const total = consolidatedIngredients.reduce(
                        (sum, ing) => sum + (ing[spec.id] || 0),
                        0
                      );
                      return (
                        <TableCell
                          key={`total-${spec.id}`}
                          align="right"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {total.toFixed(2)}
                        </TableCell>
                      );
                    })}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ margin: 1 }}>
      <Stack direction="row" alignItems="center" mb={2} gap={10}>
        <Typography variant="h6" component="div">
          Menu Items
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={viewMode === 'consolidated'}
              onChange={(e) =>
                setViewMode(e.target.checked ? 'consolidated' : 'individual')
              }
              color="primary"
            />
          }
          label="Consolidated View"
          labelPlacement="start"
        />
      </Stack>
      <Table size="small">
        <TableBody>
          {viewMode === 'individual'
            ? renderIndividualView()
            : renderConsolidatedView()}
        </TableBody>
      </Table>
    </Box>
  );
};
