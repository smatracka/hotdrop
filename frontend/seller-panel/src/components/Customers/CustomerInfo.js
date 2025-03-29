import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Link,
  Avatar
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ShoppingBag as ShoppingBagIcon,
  MailOutline as MailOutlineIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDate, formatPrice } from '../../utils/helpers';

const CustomerInfo = ({ customer, onExportData, onDeleteData }) => {
  if (!customer) return null;
  
  return (
    <Grid container spacing={3}>
      {/* Podstawowe informacje o kliencie */}
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                bgcolor: (theme) => theme.palette.primary.main
              }}
            >
              {customer.name.charAt(0)}
            </Avatar>
            <Typography variant="h6" align="center">
              {customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              Klient od {formatDate(customer.createdAt, 'short')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                icon={<ShoppingBagIcon fontSize="small" />}
                label={`${customer.ordersCount} zamówień`}
                size="small"
                variant="outlined"
              />
              {customer.totalSpent > 0 && (
                <Chip
                  label={`${formatPrice(customer.totalSpent)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <List dense>
            <ListItem>
              <EmailIcon color="action" sx={{ mr: 2 }} />
              <ListItemText 
                primary="Email" 
                secondary={
                  <Link href={`mailto:${customer.email}`} color="inherit">
                    {customer.email}
                  </Link>
                }
              />
            </ListItem>
            
            {customer.phone && (
              <ListItem>
                <PhoneIcon color="action" sx={{ mr: 2 }} />
                <ListItemText 
                  primary="Telefon" 
                  secondary={
                    <Link href={`tel:${customer.phone}`} color="inherit">
                      {customer.phone}
                    </Link>
                  }
                />
              </ListItem>
            )}
            
            {customer.address && (
              <ListItem>
                <LocationIcon color="action" sx={{ mr: 2 }} />
                <ListItemText 
                  primary="Adres" 
                  secondary={
                    <>
                      {customer.address.street}<br />
                      {customer.address.postalCode} {customer.address.city}<br />
                      {customer.address.country}
                    </>
                  }
                />
              </ListItem>
            )}
            
            <ListItem>
              <CalendarIcon color="action" sx={{ mr: 2 }} />
              <ListItemText 
                primary="Data rejestracji" 
                secondary={formatDate(customer.createdAt, 'datetime')}
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Preferencje komunikacji
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              icon={<MailOutlineIcon fontSize="small" />}
              label="Marketing"
              size="small"
              color={customer.consents?.marketing ? "success" : "default"}
              variant={customer.consents?.marketing ? "filled" : "outlined"}
            />
            <Chip
              icon={<MailOutlineIcon fontSize="small" />}
              label="Newsletter"
              size="small"
              color={customer.consents?.newsletter ? "success" : "default"}
              variant={customer.consents?.newsletter ? "filled" : "outlined"}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            RODO
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => onExportData(customer._id)}
            >
              Eksportuj dane
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDeleteData(customer._id)}
            >
              Usuń dane
            </Button>
          </Box>
        </Paper>
      </Grid>
      
      {/* Historia zamówień klienta */}
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Historia zamówień
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {customer.orders && customer.orders.length > 0 ? (
            <List>
              {customer.orders.map((order) => (
                <ListItem
                  key={order._id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1.5
                  }}
                  component={Link}
                  href={`/orders/${order._id}`}
                  underline="none"
                  color="inherit"
                >
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.date, 'short')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Chip
                        label={order.status}
                        size="small"
                        color={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'shipped' ? 'info' :
                          order.status === 'paid' ? 'primary' :
                          order.status === 'cancelled' ? 'error' : 'default'
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={6} sm={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2">
                        {formatPrice(order.total)}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Brak historii zamówień
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CustomerInfo;