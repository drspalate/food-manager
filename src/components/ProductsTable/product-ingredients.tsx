import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import React from 'react';

export const ProductIngredients = ({
  product,
  ingredients,
  specifications,
}) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Ingredient</TableCell>
          <TableCell align="right">Quantity (g)</TableCell>
          {specifications.map((spec) => (
            <TableCell key={spec.id} align="right">
              {spec.label}
              {spec.unit ? ` (${spec.unit})` : ''}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {product.ingredients?.map((ing, idx) => {
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
          if (!ingredient) return null;

          const ratio = ing.quantity / 100;

          return (
            <TableRow key={idx}>
              <TableCell>{ingredient.ingredient}</TableCell>
              <TableCell align="right">{ing.quantity}g</TableCell>
              {specifications.map((spec) => {
                const value = ingredient[spec.id];
                const displayValue =
                  typeof value === 'number'
                    ? (value * ratio).toFixed(2)
                    : value || '-';

                return (
                  <TableCell key={spec.id} align="right">
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
