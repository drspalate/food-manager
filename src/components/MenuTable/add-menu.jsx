import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

export const AddMenu = ({
  openDialog,
  handleCloseDialog,
  handleSubmit,
  editingMenu,
  formState,
  handleInputChange,
  handleMenuItemChange,
  addMenuItem,
  removeMenuItem,
  products,
}) => {
  return (
    <Dialog
      open={openDialog}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{editingMenu ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Menu Name"
            type="text"
            fullWidth
            variant="standard"
            value={formState.name}
            onChange={handleInputChange}
            required
          />

          <TextField
            margin="dense"
            name="count"
            label="Count"
            type="number"
            fullWidth
            variant="standard"
            value={formState.count || 1}
            onChange={handleInputChange}
            inputProps={{ min: 1 }}
            required
            sx={{ mt: 2 }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Menu Items
          </Typography>

          {formState.items.map((item, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
            >
              <FormControl variant="standard" sx={{ flex: 1 }}>
                <InputLabel>Product</InputLabel>
                <Select
                  value={item.productId}
                  onChange={(e) =>
                    handleMenuItemChange(index, 'productId', e.target.value)
                  }
                  required
                >
                  <MenuItem value="">
                    <em>Select a product</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="number"
                label="Quantity"
                variant="standard"
                value={item.quantity}
                onChange={(e) =>
                  handleMenuItemChange(
                    index,
                    'quantity',
                    parseInt(e.target.value) || 1
                  )
                }
                inputProps={{ min: 1 }}
                style={{ width: '100px' }}
                required
              />

              <IconButton
                onClick={() => removeMenuItem(index)}
                disabled={formState.items.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button onClick={addMenuItem} startIcon={<AddIcon />} sx={{ mt: 1 }}>
            Add Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit" variant="contained">
            {editingMenu ? 'Update' : 'Add'} Menu
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
