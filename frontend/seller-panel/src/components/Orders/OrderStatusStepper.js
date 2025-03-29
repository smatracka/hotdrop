import React from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  Typography, 
  Box 
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';

const OrderStatusStepper = ({ currentStatus }) => {
  // Mapowanie statusów na kroki
  const statusMap = {
    pending: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1 // Specjalny przypadek
  };
  
  // Definicja kroków
  const steps = [
    {
      label: 'Zamówione',
      description: 'Zamówienie zostało złożone',
      icon: <CartIcon />
    },
    {
      label: 'Opłacone',
      description: 'Płatność została zrealizowana',
      icon: <PaymentIcon />
    },
    {
      label: 'Wysłane',
      description: 'Zamówienie zostało wysłane',
      icon: <ShippingIcon />
    },
    {
      label: 'Dostarczone',
      description: 'Zamówienie zostało dostarczone',
      icon: <DeliveredIcon />
    }
  ];
  
  // Aktualny krok
  const activeStep = statusMap[currentStatus] !== undefined ? statusMap[currentStatus] : 0;
  
  // Jeśli zamówienie jest anulowane, wyświetlamy specjalny komunikat
  if (currentStatus === 'cancelled') {
    return (
      <Paper 
        elevation={0} 
        sx={{
          p: 2,
          bgcolor: '#FFF4F4',
          border: '1px solid #FFCDD2',
          borderRadius: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CancelledIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="body1" color="error">
            Zamówienie zostało anulowane
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.label} completed={activeStep > index}>
            <StepLabel 
              StepIconProps={{ 
                icon: step.icon 
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default OrderStatusStepper;