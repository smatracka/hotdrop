import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { getProduct, updateProduct } from '../../services/productService';
import PageHeader from '../../components/common/PageHeader';
import ProductForm from '../../components/Products/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Pobierz dane produktu
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
        
        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Nie udało się pobrać danych produktu');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Wystąpił błąd podczas pobierania danych produktu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Obsługa aktualizacji produktu
  const handleSubmit = async (productData) => {
    try {
      setSaving(true);
      
      // Dodaj ID sprzedawcy
      const data = {
        ...productData,
        seller: user.id
      };
      
      const response = await updateProduct(id, data);
      
      if (response.success) {
        toast.success('Produkt został zaktualizowany pomyślnie');
        setProduct(response.data);
      } else {
        toast.error(response.message || 'Błąd podczas aktualizacji produktu');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Wystąpił błąd podczas aktualizacji produktu');
    } finally {
      setSaving(false);
    }
  };
  
  const breadcrumbs = [
    { label: 'Produkty', path: '/products' },
    { label: product ? product.name : 'Edycja produktu' }
  ];
  
  return (
    <Box>
      <PageHeader 
        title={product ? `Edycja: ${product.name}` : 'Edycja produktu'} 
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </Box>
  );
};

export default EditProduct;