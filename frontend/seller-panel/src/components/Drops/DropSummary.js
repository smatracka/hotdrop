// frontend/seller-panel/src/components/Drops/DropSummary.js
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaletteIcon from '@mui/icons-material/Palette';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { format } from 'date-fns';
import { fetchProductsByIds } from '../../services/productService';

const DropSummary = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationIssues, setValidationIssues] = useState([]);
  
  // Pobierz szczegóły produktów
  useEffect(() => {
    const fetchProducts = async () => {
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        try {
          setLoading(true);
          
          // Zamiast faktycznego wywołania API, zwracamy sztuczne dane
          const mockProducts = [
            {
              _id: '1',
              name: 'Produkt testowy 1',
              sku: 'TEST-001',
              description: 'Opis produktu testowego 1',
              price: 99.99,
              quantity: 10,
              category: 'Odzież',
              status: 'active',
              imageUrls: ['/images/placeholder-image.svg']
            },
            {
              _id: '2',
              name: 'Produkt testowy 2',
              sku: 'TEST-002',
              description: 'Opis produktu testowego 2',
              price: 199.99,
              quantity: 5,
              category: 'Elektronika',
              status: 'active',
              imageUrls: ['/images/placeholder-image.svg']
            },
            {
              _id: '3',
              name: 'Produkt testowy 3',
              sku: 'TEST-003',
              description: 'Opis produktu testowego 3',
              price: 49.99,
              quantity: 20,
              category: 'Akcesoria',
              status: 'active',
              imageUrls: ['/images/placeholder-image.svg']
            }
          ];
          
          // Filtrujemy produkty, aby dopasować je do ID w data.products
          const filteredProducts = mockProducts.filter(p => 
            data.products.includes(p._id)
          );
          
          setProducts(filteredProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProducts();
  }, [data.products]);
  
  // Walidacja dropu
  useEffect(() => {
    const issues = [];
    
    if (!data.name) {
      issues.push('Nazwa dropu jest wymagana');
    }
    
    if (!data.startDate) {
      issues.push('Data rozpoczęcia dropu jest wymagana');
    }
    
    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      issues.push('Drop musi zawierać co najmniej jeden produkt');
    }
    
    setValidationIssues(issues);
  }, [data]);
  
  // Formatowanie daty
  const formatDate = (date) => {
    if (!date) return 'Nie ustawiono';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('pl-PL') + ' ' + dateObj.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  };
  
  // Podsumowanie dostępności
  const AvailabilitySummary = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Dostępność
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Data rozpoczęcia" 
            secondary={formatDate(data.startDate)} 
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Czas trwania" 
            secondary={data.endDate 
              ? `Do ${formatDate(data.endDate)}` 
              : `${data.timeLimit || 10} minut`} 
          />
        </ListItem>
      </List>
    </Box>
  );
  
  // Podsumowanie wyglądu
  const AppearanceSummary = () => {
    const customization = data.customization || {
      headerColor: '#1a1a2e',
      buttonColor: '#4CAF50',
      fontColor: '#333333',
      backgroundColor: '#f8f9fa',
    };
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Wygląd
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PaletteIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Schemat kolorów" 
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: customization.headerColor,
                      border: '1px solid #ccc',
                      borderRadius: 1
                    }}
                    title="Kolor nagłówka"
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: customization.buttonColor,
                      border: '1px solid #ccc',
                      borderRadius: 1
                    }}
                    title="Kolor przycisków"
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: customization.fontColor,
                      border: '1px solid #ccc',
                      borderRadius: 1
                    }}
                    title="Kolor tekstu"
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: customization.backgroundColor,
                      border: '1px solid #ccc',
                      borderRadius: 1
                    }}
                    title="Kolor tła"
                  />
                </Box>
              } 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logo" 
              secondary={
                customization.logoUrl 
                  ? <img 
                      src={customization.logoUrl} 
                      alt="Logo" 
                      style={{ height: 30, marginTop: 8 }} 
                    />
                  : "Brak logo"
              } 
            />
          </ListItem>
        </List>
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Podsumowanie dropu
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Alerts */}
      {validationIssues.length > 0 ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Drop nie może zostać opublikowany z powodu następujących problemów:
          </Typography>
          <List dense>
            {validationIssues.map((issue, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ErrorOutlineIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Drop jest gotowy do publikacji!
          </Typography>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlineIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Wszystkie wymagane informacje zostały uzupełnione" />
          </ListItem>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Podstawowe informacje */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {data.name || "Bez nazwy"}
            </Typography>
            <Chip 
              label={data.status || "Szkic"} 
              size="small" 
              color={data.status === 'published' ? 'success' : 'default'}
              sx={{ mb: 2 }} 
            />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {data.description || "Brak opisu"}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <AvailabilitySummary />
            
            <Divider sx={{ my: 2 }} />
            
            <AppearanceSummary />
          </Paper>
        </Grid>
        
        {/* Produkty */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Produkty ({products.length})
            </Typography>
            
            {products.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Brak wybranych produktów
              </Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nazwa</TableCell>
                      <TableCell align="right">Cena</TableCell>
                      <TableCell align="right">Ilość</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {product.imageUrls && product.imageUrls[0] && (
                              <Box
                                component="img"
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  mr: 1
                                }}
                                src={product.imageUrls[0]}
                                alt={product.name}
                              />
                            )}
                            <Box>
                              <Typography variant="body2">
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {product.sku}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {product.price} zł
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {product.quantity}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Podsumowanie
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Łączna liczba produktów:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right" fontWeight="bold">
                    {products.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Łączna liczba sztuk:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right" fontWeight="bold">
                    {products.reduce((sum, product) => sum + (product.quantity || 0), 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Najniższa cena:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right" fontWeight="bold">
                    {products.length > 0 ? `${Math.min(...products.map(p => p.price || 0))} zł` : 'N/D'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Najwyższa cena:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right" fontWeight="bold">
                    {products.length > 0 ? `${Math.max(...products.map(p => p.price || 0))} zł` : 'N/D'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DropSummary;