// frontend/seller-panel/src/components/Drops/ProductSelection.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getProducts } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

const ProductSelection = ({ selectedProducts = [], onProductsChange }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  // Pobierz produkty
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ sellerId: user.id, status: 'active' });
        setProducts(response.data);
        
        // Ekstrahuj unikalne kategorie
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        setCategories(uniqueCategories);
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
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Obsługa zaznaczenia produktu
  const handleProductSelect = (productId) => {
    const isSelected = selectedProducts.includes(productId);
    let newSelectedProducts;
    
    if (isSelected) {
      newSelectedProducts = selectedProducts.filter(id => id !== productId);
    } else {
      newSelectedProducts = [...selectedProducts, productId];
    }
    
    onProductsChange(newSelectedProducts);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wybierz produkty
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Szukaj produktów"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kategoria</InputLabel>
              <Select
                value={categoryFilter}
                label="Kategoria"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Wszystkie kategorie</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Wybrane produkty: {selectedProducts.length}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredProducts.map(product => {
            const isSelected = selectedProducts.includes(product._id);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: isSelected ? '2px solid #4CAF50' : 'none',
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleProductSelect(product._id)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.imageUrls[0] || "/placeholder-image.jpg"}
                        alt={product.name}
                      />
                      <Checkbox
                        checked={isSelected}
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          margin: '8px',
                          '&.Mui-checked': {
                            color: '#4CAF50',
                          }
                        }}
                        onChange={() => handleProductSelect(product._id)}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        SKU: {product.sku}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" color="text.primary" fontWeight="bold">
                          {product.price} zł
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ilość: {product.quantity}
                        </Typography>
                      </Box>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ backgroundColor: '#f0f2f5' }} 
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Nie znaleziono produktów pasujących do kryteriów wyszukiwania.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                >
                  Wyczyść filtry
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ProductSelection;
