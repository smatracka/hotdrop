import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper, Grid, Chip, Divider } from '@mui/material';
import { getDrop } from '../../services/dropService';
import { formatPrice } from '../../utils/helpers';

const PreviewDrop = () => {
  const { id } = useParams();
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchDropData = async () => {
      try {
        setLoading(true);
        const response = await getDrop(id);
        
        if (response.success) {
          setDrop(response.data);
          
          // Tutaj możemy zasymulować pobieranie produktów
          // W rzeczywistej aplikacji produkty byłyby pobierane z API
          const mockProducts = [
            {
              _id: '1',
              name: 'Produkt testowy 1',
              price: 99.99,
              description: 'Opis produktu 1',
              imageUrls: ['/images/placeholder-image.svg']
            },
            {
              _id: '2',
              name: 'Produkt testowy 2',
              price: 199.99,
              description: 'Opis produktu 2',
              imageUrls: ['/images/placeholder-image.svg']
            }
          ];
          
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching drop:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDropData();
  }, [id]);
  
  // Zastosowanie stylów z customizacji dropu
  const getCustomStyles = () => {
    if (!drop || !drop.customization) return {};
    
    return {
      header: {
        backgroundColor: drop.customization.headerColor || '#1a1a2e',
        color: '#ffffff'
      },
      button: {
        backgroundColor: drop.customization.buttonColor || '#4CAF50',
        color: '#ffffff'
      },
      body: {
        backgroundColor: drop.customization.backgroundColor || '#f8f9fa',
        color: drop.customization.fontColor || '#333333'
      }
    };
  };
  
  const styles = getCustomStyles();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!drop) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Drop nie został znaleziony</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Nagłówek */}
      <Box sx={{ 
        p: 2, 
        ...styles.header,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h5">{drop.name}</Typography>
        
        {drop.customization?.logoUrl && (
          <img 
            src={drop.customization.logoUrl} 
            alt="Logo" 
            style={{ height: 40 }} 
          />
        )}
      </Box>
      
      {/* Treść */}
      <Box sx={{ p: 3, ...styles.body }}>
        <Typography variant="body1" paragraph>
          {drop.description}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Chip 
            label={`Zakończenie: ${new Date(drop.endDate || Date.now() + (drop.timeLimit || 10) * 60000).toLocaleString()}`}
            color="primary"
            sx={{ mr: 1 }}
          />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Produkty
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box
                  component="img"
                  src={product.imageUrls[0] || '/images/placeholder-image.svg'}
                  alt={product.name}
                  sx={{ width: '100%', height: 200, objectFit: 'cover', mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" paragraph>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    {formatPrice(product.price)}
                  </Typography>
                  <Button 
                    variant="contained"
                    sx={styles.button}
                  >
                    Kup teraz
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PreviewDrop;