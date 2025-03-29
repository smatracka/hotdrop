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
  Alert
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loginSchema } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await login(data.email, data.password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Błąd logowania');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
      console.error('Login error:', error);
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
        Zaloguj się do konta
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Wprowadź swoje dane logowania
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
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
        
        <TextField
          margin="normal"
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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Nie pamiętasz hasła?
          </Link>
        </Box>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Zaloguj się'}
        </Button>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Nie masz jeszcze konta?{' '}
            <Link component={RouterLink} to="/register">
              Zarejestruj się
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;