import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Strona nie została znaleziona
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Przepraszamy, nie mogliśmy znaleźć strony, której szukasz.
          <br />
          Sprawdź, czy adres URL jest poprawny lub wróć do strony głównej.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          size="large"
          sx={{ mt: 2 }}
        >
          Powrót do strony głównej
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;