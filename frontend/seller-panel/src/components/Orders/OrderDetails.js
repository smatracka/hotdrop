import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import { 
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { formatPrice, formatDate } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import OrderStatusStepper from './OrderStatusStepper';

const OrderDetails = ({ order, onGenerateInvoice }) => {
  if (!order) return null;
  
  return (
    <Box>
      {/* Nagłówek */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Zamówienie #{order.orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Złożone: {formatDate(order.createdAt, 'datetime')}
          </Typography>
        </Box>
        <StatusBadge status={order.status} />
      </Box>
      
      {/* Stepper statusu zamówienia */}
      <Box sx={{ mb: 3 }}>
        <OrderStatusStepper currentStatus={order.status} />
      </Box>
      
      <Grid container spacing={3}>
        {/* Dane klienta i adres */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Dane klienta
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">{order.customer.name}</Typography>
              <Typography variant="body2">{order.customer.email}</Typography>
              <Typography variant="body2">{order.customer.phone}</Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Adres dostawy
            </Typography>
            <Box>
              <Typography variant="body2">{order.customer.address.street}</Typography>
              <Typography variant="body2">
                {order.customer.address.postalCode} {order.customer.address.city}
              </Typography>
              <Typography variant="body2">{order.customer.address.country}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Szczegóły płatności */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Szczegóły płatności
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Metoda płatności:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {order.paymentMethod === 'blik' ? 'BLIK' : order.paymentMethod}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status płatności:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <StatusBadge status={order.paymentStatus} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">ID płatności:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{order.paymentId || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReceiptIcon />}
                onClick={() => onGenerateInvoice(order._id)}
              >
                Generuj fakturę
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<EmailIcon />}
              >
                Kontakt z klientem
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Produkty zamówienia */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Zamówione produkty
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell align="right">Cena</TableCell>
                    <TableCell align="right">Ilość</TableCell>
                    <TableCell align="right">Suma</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item._id || `item-${item.product._id}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.product.imageUrls && item.product.imageUrls[0] && (
                            <Box
                              component="img"
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 1
                              }}
                              src={item.product.imageUrls[0]}
                              alt={item.product.name}
                            />
                          )}
                          <Box>
                            <Typography variant="body2">
                              {item.product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item.product.sku}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatPrice(item.price)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(item.total)}</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">
                      <Typography variant="subtitle2">Suma:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">{formatPrice(order.totalAmount)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Notatki / informacje dodatkowe */}
        {order.notes && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Notatki
              </Typography>
              <Typography variant="body2">{order.notes}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OrderDetails;
