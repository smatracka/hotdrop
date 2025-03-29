import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { productSchema } from '../../utils/validation';
import ProductGallery from './ProductGallery';
import { useAuth } from '../../contexts/AuthContext';

const ProductForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const { user } = useAuth();
  const [images, setImages] = useState(initialData.imageUrls || []);
  
  // Defaultowe wartości dla formularza
  const defaultValues = {
    name: initialData.name || '',
    description: initialData.description || '',
    sku: initialData.sku || '',
    price: initialData.price || '',
    quantity: initialData.quantity || 0,
    category: initialData.category || '',
    status: initialData.status || 'draft'
  };
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues
  });
  
  // Obsługa zatwierdzania formularza
  const handleFormSubmit = (data) => {
    // Dodanie zdjęć do danych produktu
    const productData = {
      ...data,
      imageUrls: images,
      seller: user.id
    };
    
    onSubmit(productData);
  };
  
  // Obsługa aktualizacji zdjęć
  const handleImagesUpdate = (updatedImages) => {
    setImages(updatedImages);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        {/* Zdjęcia produktu */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Zdjęcia produktu
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <ProductGallery 
              images={images}
              onChange={handleImagesUpdate}
            />
          </Paper>
        </Grid>
        
        {/* Podstawowe informacje */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informacje o produkcie
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nazwa produktu"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SKU"
                      fullWidth
                      required
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.category}>
                      <InputLabel id="category-label">Kategoria</InputLabel>
                      <Select
                        {...field}
                        labelId="category-label"
                        label="Kategoria"
                      >
                        <MenuItem value="">Wybierz kategorię</MenuItem>
                        <MenuItem value="clothing">Odzież</MenuItem>
                        <MenuItem value="shoes">Obuwie</MenuItem>
                        <MenuItem value="accessories">Akcesoria</MenuItem>
                        <MenuItem value="electronics">Elektronika</MenuItem>
                        <MenuItem value="home">Dom</MenuItem>
                        <MenuItem value="beauty">Uroda</MenuItem>
                        <MenuItem value="other">Inne</MenuItem>
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error">
                          {errors.category.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opis produktu"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Cena i dostępność */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cena i dostępność
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cena"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">zł</InputAdornment>,
                      }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ilość dostępna"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 0 }}
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status"
                      >
                        <MenuItem value="draft">Szkic</MenuItem>
                        <MenuItem value="active">Aktywny</MenuItem>
                        <MenuItem value="hidden">Ukryty</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Przyciski akcji */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (initialData._id ? 'Zapisz zmiany' : 'Dodaj produkt')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductForm;
