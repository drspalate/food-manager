import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

const ColumnForm = ({ open, onClose, onSubmit }) => {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!columnName.trim()) return;

    const newColumn = {
      id: columnName.toLowerCase().replace(/\s+/g, '_'),
      label: columnName,
      type: columnType,
    };

    onSubmit(newColumn);
    setColumnName('');
    setColumnType('text');
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Column Name"
              fullWidth
              variant="outlined"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              required
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="column-type-label">Data Type</InputLabel>
              <Select
                labelId="column-type-label"
                value={columnType}
                onChange={(e) => setColumnType(e.target.value)}
                label="Data Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add Column
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ColumnForm;
