import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { resetPasswordSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema)
  });
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await forgotPassword(data.email);
      
      if (result.success) {
        setSuccess('Instrukcje resetowania hasła zostały wysłane na podany adres e-mail.');
      } else {
        setError(result.message || 'Błąd resetowania hasła');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas wysyłania instrukcji resetowania hasła. Spróbuj ponownie.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 3
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Resetowanie hasła
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Podaj adres email, na który wyślemy instrukcje resetowania hasła
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', maxWidth: 450 }}>
        <TextField
          margin="normal"
          fullWidth
          id="email"
          label="Email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Resetuj hasło'}
        </Button>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Pamiętasz swoje hasło?{' '}
            <Link component={RouterLink} to="/login">
              Zaloguj się
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;