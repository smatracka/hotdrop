// frontend/seller-panel/src/layouts/AuthLayout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Link as MuiLink
} from '@mui/material';

const AuthLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <Box 
        component="header" 
        sx={{ 
          py: 2, 
          px: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            color: theme.palette.primary.main,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Drop Commerce
        </Typography>
        
        <Box>
          <MuiLink 
            component={Link} 
            to="/register" 
            sx={{ 
              ml: 2, 
              textDecoration: 'none',
              color: theme.palette.text.primary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Rejestracja
          </MuiLink>
          <MuiLink 
            component={Link} 
            to="/login" 
            sx={{ 
              ml: 2, 
              textDecoration: 'none',
              color: theme.palette.text.primary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Logowanie
          </MuiLink>
        </Box>
      </Box>
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {isMobile ? (
          <Container maxWidth="sm">
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4,
                borderRadius: 2,
              }}
            >
              <Outlet />
            </Paper>
          </Container>
        ) : (
          <Container maxWidth="lg">
            <Grid container spacing={0} sx={{ height: '100%' }}>
              {/* Left side - illustration */}
              <Grid item xs={12} md={6} 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 4,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '8px 0 0 8px',
                  color: '#fff',
                }}
              >
                <Typography variant="h3" component="h1" gutterBottom>
                  Drop Commerce
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Platforma dla sprzedaży w trybie drop
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Zwiększ swoje przychody dzięki ekscytującym dropom, które przyciągną tłumy klientów.
                  Zarządzaj produktami, śledź sprzedaż i analizuj wyniki - wszystko w jednym miejscu.
                </Typography>
                
                <Box 
                  component="img" 
                  src="/images/auth-illustration.svg" 
                  alt="Illustration"
                  sx={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    mt: 4,
                    display: { xs: 'none', lg: 'block' }
                  }}
                />
              </Grid>
              
              {/* Right side - form */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  <Outlet />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 3,
          mt: 'auto',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Drop Commerce. Wszelkie prawa zastrzeżone.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <MuiLink href="#" color="inherit" sx={{ mx: 1 }}>
            Polityka prywatności
          </MuiLink>
          <MuiLink href="#" color="inherit" sx={{ mx: 1 }}>
            Warunki korzystania
          </MuiLink>
          <MuiLink href="#" color="inherit" sx={{ mx: 1 }}>
            Pomoc
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
