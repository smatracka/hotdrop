import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct } from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';
import ProductForm from '../../components/Products/ProductForm';

const NewProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Obsługa tworzenia produktu
  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
      
      // Dodaj ID sprzedawcy
      const data = {
        ...productData,
        seller: user.id
      };
      
      const response = await createProduct(data);
      
      if (response.success) {
        toast.success('Produkt został utworzony pomyślnie');
        navigate('/products');
      } else {
        toast.error(response.message || 'Błąd podczas tworzenia produktu');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Wystąpił błąd podczas tworzenia produktu');
    } finally {
      setLoading(false);
    }
  };
  
  const breadcrumbs = [
    { label: 'Produkty', path: '/products' },
    { label: 'Nowy produkt' }
  ];
  
  return (
    <Box>
      <PageHeader 
        title="Nowy produkt" 
        breadcrumbs={breadcrumbs}
      />
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Powrót do listy produktów
        </Button>
      </Box>
      
      <ProductForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Box>
  );
};

export default NewProduct;