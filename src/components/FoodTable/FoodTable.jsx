import {
  AddBox as AddBoxIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

const FoodTable = ({ data, columns, onAddItem, onAddColumn, onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term (case-insensitive)
  const filteredData = data.filter((item) =>
    item.ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" component="h1">
            Food Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddItem}
              sx={{ mr: 1 }}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddBoxIcon />}
              onClick={onAddColumn}
            >
              Add Column
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell style={{ width: 50 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    {searchTerm
                      ? 'No matching ingredients found.'
                      : 'No data available. Click "Add Item" to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.id}`}>
                        {row[column.id]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => onMenuClick(e, row)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FoodTable;
