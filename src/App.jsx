import {
  Alert,
  AppBar,
  Box,
  Container,
  CssBaseline,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  addNewSpecification,
  deleteIngredient,
  getAllIngredients,
  getAllSpecifications,
  saveIngredient,
} from './utils';

import ActionMenu from './components/common/ActionMenu';
import ColumnForm from './components/ColumnForm/ColumnForm';
import FoodForm from './components/FoodForm/FoodForm';
import FoodTable from './components/FoodTable/FoodTable';
import ProductsTable from './components/ProductsTable/ProductsTable';
import MenuTable from './components/MenuTable/MenuTable';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load data and columns from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [foodItems, columnsData] = await Promise.all([
          getAllIngredients(),
          getAllSpecifications(),
        ]);

        setData(foodItems);
        setColumns(columnsData);
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Error loading data', 'error');
      }
    };

    loadData();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      const savedItem = await saveIngredient(formData);

      if (editingItem) {
        setData(
          data.map((item) => (item.id === savedItem.id ? savedItem : item))
        );
        showSnackbar('Item updated successfully');
      } else {
        setData([...data, savedItem]);
        showSnackbar('Item added successfully');
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving item:', error);
      showSnackbar('Error saving item', 'error');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteIngredient(id);
      setData(data.filter((item) => item.id !== id));
      showSnackbar('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Error deleting item', 'error');
    }
  };

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleOpenColumnForm = () => {
    setIsColumnFormOpen(true);
  };

  const handleCloseColumnForm = () => {
    setIsColumnFormOpen(false);
  };

  const handleAddNewColumn = async (newColumn) => {
    try {
      // Save the new column to the database
      const savedColumn = await addNewSpecification(newColumn);

      // Update the columns state
      setColumns((prev) => [...prev, savedColumn]);

      // Add the new column to existing data with empty values
      setData((prevData) =>
        prevData.map((item) => ({
          ...item,
          [savedColumn.id]: item[savedColumn.id] || '',
        }))
      );

      showSnackbar('Column added successfully');
      handleCloseColumnForm();
    } catch (error) {
      console.error('Error adding column:', error);
      showSnackbar('Error adding column', 'error');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="static" color="default">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="food management tabs"
        >
          <Tab label="Ingredients" {...a11yProps(0)} />
          <Tab label="Products" {...a11yProps(1)} />
          <Tab label="Menu" {...a11yProps(2)} />
        </Tabs>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, pb: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <FoodTable
            data={data}
            columns={columns}
            onAddItem={handleOpenForm}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddColumn={handleOpenColumnForm}
            onMenuClick={handleMenuClick}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProductsTable />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <MenuTable />
        </TabPanel>
      </Container>

      {/* Food Form Dialog */}
      <FoodForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        columns={columns}
        initialData={editingItem}
        isEditing={!!editingItem}
      />

      {/* Add Column Dialog */}
      <ColumnForm
        open={isColumnFormOpen}
        onClose={handleCloseColumnForm}
        onSubmit={handleAddNewColumn}
      />

      {/* Action Menu */}
      <ActionMenu
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        item={selectedRow}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
