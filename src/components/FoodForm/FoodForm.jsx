import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import React from 'react';

const FoodForm = ({
  open,
  onClose,
  onSubmit,
  columns,
  initialData = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = React.useState(
    initialData || Object.fromEntries(columns.map((col) => [col.id, '']))
  );

  React.useEffect(() => {
    if (initialData) {
      // Ensure all current columns are in the form data
      const newFormData = { ...initialData };
      columns.forEach((col) => {
        if (newFormData[col.id] === undefined) {
          newFormData[col.id] = '';
        }
      });
      setFormData(newFormData);
    } else {
      setFormData(Object.fromEntries(columns.map((col) => [col.id, ''])));
    }
  }, [initialData, columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that no required fields are empty
    for (const key in formData) {
      if (formData[key] === '') {
        alert('Please fill in all fields');
        return;
      }
    }

    const formValues = {};
    for (const key in formData) {
      const column = columns.find((col) => col.id === key);
      if (column?.type === 'number') {
        formValues[key] = Number(formData[key]);
      } else {
        formValues[key] = formData[key];
      }
    }

    onSubmit(formValues);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          {columns.map((column) => (
            <TextField
              key={column.id}
              autoFocus={column.id === 'ingredient'}
              margin="dense"
              name={column.id}
              label={column.label}
              type={column.type || 'text'}
              fullWidth
              variant="standard"
              value={formData[column.id] || ''}
              onChange={handleChange}
              required
              inputProps={column.type === 'number' ? { step: '0.01' } : {}}
              sx={{ mb: 2 }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FoodForm;
