import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const EmptyState = ({ 
  title = 'Brak danych',
  description = 'Nie znaleziono żadnych danych',
  icon: Icon,
  actionLabel,
  onAction
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        textAlign: 'center', 
        p: 4, 
        borderRadius: 2,
        border: '1px dashed #ccc',
        bgcolor: 'background.default' 
      }}
    >
      {Icon && (
        <Box sx={{ mb: 2 }}>
          <Icon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
      )}
      
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;