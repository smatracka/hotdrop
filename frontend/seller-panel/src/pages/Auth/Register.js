import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registerSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema)
  });
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        company: data.company
      });
      
      if (result.success) {
        setSuccess('Rejestracja zakończona pomyślnie. Możesz się teraz zalogować.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Błąd rejestracji');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      console.error('Register error:', error);
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
        Zarejestruj swoje konto
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Wypełnij poniższy formularz, aby utworzyć konto sprzedawcy
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
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', maxWidth: 600 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Dane osobowe
        </Typography>
        
        <TextField
          fullWidth
          id="name"
          label="Imię i nazwisko"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          id="email"
          label="Email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 3 }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="password"
              label="Hasło"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="confirmPassword"
              label="Powtórz hasło"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Dane firmy
        </Typography>
        
        <TextField
          fullWidth
          id="companyName"
          label="Nazwa firmy"
          {...register('company.name')}
          error={!!errors.company?.name}
          helperText={errors.company?.name?.message}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          id="companyVatId"
          label="NIP"
          {...register('company.vatId')}
          error={!!errors.company?.vatId}
          helperText={errors.company?.vatId?.message}
          sx={{ mb: 3 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              {...register('acceptTerms')}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Akceptuję {' '}
              <Link component={RouterLink} to="/terms" target="_blank">
                regulamin serwisu
              </Link>
              {' '} oraz {' '}
              <Link component={RouterLink} to="/privacy" target="_blank">
                politykę prywatności
              </Link>
            </Typography>
          }
          sx={{ mb: 3 }}
        />
        {errors.acceptTerms && (
          <Typography variant="caption" color="error">
            {errors.acceptTerms.message}
          </Typography>
        )}
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ py: 1.5, mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Zarejestruj się'}
        </Button>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Masz już konto?{' '}
            <Link component={RouterLink} to="/login">
              Zaloguj się
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;