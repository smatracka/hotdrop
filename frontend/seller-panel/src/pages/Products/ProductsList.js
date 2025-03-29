import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, deleteProduct, updateProduct } from '../../services/productService';
import { formatPrice } from '../../utils/helpers';

const ProductsList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Pobierz produkty
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ sellerId: user.id });
        setProducts(response.data.docs || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [user.id]);
  
  // Filtrowanie produktów
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Unikalne kategorie dla filtra
  const categories = [...new Set(products.map(product => product.category))];
  
  // Obsługa menu akcji produktu
  const handleActionMenuOpen = (event, product) => {
    setActionMenuAnchor(event.currentTarget);
    setCurrentProduct(product);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setCurrentProduct(null);
  };
  
  // Obsługa usuwania produktu
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete._id);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success('Produkt został usunięty');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Błąd podczas usuwania produktu');
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  // Obsługa zmiany statusu produktu
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProduct(productId, { status: newStatus });
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, status: newStatus } 
          : product
      ));
      toast.success(`Status produktu został zmieniony na: ${newStatus}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Błąd podczas zmiany statusu produktu');
    }
    
    handleActionMenuClose();
  };
  
  // Obsługa zaznaczania produktów
  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Obsługa akcji zbiorczych
  const handleBulkDelete = () => {
    // Implementacja usuwania zaznaczonych produktów
    toast.info('Funkcja usuwania wielu produktów zostanie zaimplementowana w przyszłej wersji.');
  };
  
  const handleBulkStatusChange = (status) => {
    // Implementacja zmiany statusu zaznaczonych produktów
    toast.info('Funkcja zmiany statusu wielu produktów zostanie zaimplementowana w przyszłej wersji.');
  };
  
  const breadcrumbs = [
    { label: 'Produkty' }
  ];
  
  return (
    <Box>
      <PageHeader 
        title="Produkty" 
        breadcrumbs={breadcrumbs}
      />
      
      {/* Panel narzędzi */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Szukaj produktów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Kategoria</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Kategoria"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Wszystkie kategorie</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Wszystkie statusy</MenuItem>
                <MenuItem value="active">Aktywne</MenuItem>
                <MenuItem value="draft">Szkice</MenuItem>
                <MenuItem value="hidden">Ukryte</MenuItem>
                <MenuItem value="out_of_stock">Brak w magazynie</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/products/new"
            >
              Dodaj produkt
            </Button>
          </Grid>
        </Grid>
        
        {selectedProducts.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" component="span" sx={{ mr: 2 }}>
              Wybrano {selectedProducts.length} {selectedProducts.length === 1 ? 'produkt' : 'produkty'}
            </Typography>
            
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              sx={{ mr: 1 }}
            >
              Usuń
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => handleBulkStatusChange('active')}
              sx={{ mr: 1 }}
            >
              Aktywuj
            </Button>
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityOffIcon />}
              onClick={() => handleBulkStatusChange('hidden')}
            >
              Ukryj
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Lista produktów */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Brak produktów"
          description={
            searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? "Nie znaleziono produktów pasujących do kryteriów wyszukiwania."
              : "Nie masz jeszcze żadnych produktów. Dodaj swój pierwszy produkt, aby rozpocząć sprzedaż."
          }
          icon={AddIcon}
          actionLabel="Dodaj produkt"
          onAction={() => window.location.href = '/products/new'}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{ position: 'relative', height: 200 }}
                >
                  <Box 
                    component="img"
                    src={product.imageUrls && product.imageUrls.length > 0 
                      ? product.imageUrls[0] 
                      : '/images/placeholder-image.svg'}
                    alt={product.name}
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <StatusBadge status={product.status} />
                  </Box>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                      onClick={(event) => handleActionMenuOpen(event, product)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleSelectProduct(product._id)}
                    sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%'
                    }}
                  />
                </CardMedia>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" component={RouterLink} to={`/products/${product._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    SKU: {product.sku}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {formatPrice(product.price)}
                    </Typography>
                    
                    <Chip 
                      label={`${product.quantity} szt.`}
                      size="small"
                      color={product.quantity > 0 ? 'default' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Menu akcji */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem 
          component={RouterLink} 
          to={`/products/${currentProduct?._id}`}
          onClick={handleActionMenuClose}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edytuj
        </MenuItem>
        
        <MenuItem 
          onClick={() => currentProduct && handleStatusChange(
            currentProduct._id, 
            currentProduct.status === 'active' ? 'hidden' : 'active'
          )}
        >
          {currentProduct?.status === 'active' ? (
            <>
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
              Ukryj
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Aktywuj
            </>
          )}
        </MenuItem>
        
        <MenuItem onClick={() => currentProduct && handleDeleteClick(currentProduct)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Usuń</Typography>
        </MenuItem>
      </Menu>
      
      {/* Dialog potwierdzenia usunięcia */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć produkt "${productToDelete?.name}"? Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmColor="error"
      />
    </Box>
  );
};

export default ProductsList;