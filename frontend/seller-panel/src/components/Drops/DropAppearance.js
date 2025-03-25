// frontend/seller-panel/src/components/Drops/DropAppearance.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Slider,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DropAppearance = ({ customization, onUpdate }) => {
  const [values, setValues] = useState({
    headerColor: customization.headerColor || '#1a1a2e',
    buttonColor: customization.buttonColor || '#4CAF50',
    fontColor: customization.fontColor || '#333333',
    backgroundColor: customization.backgroundColor || '#f8f9fa',
    logoUrl: customization.logoUrl || '',
  });
  
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColorField, setCurrentColorField] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(customization.logoUrl || '');
  
  // Aktualizuj dane przy każdej zmianie
  useEffect(() => {
    onUpdate(values);
  }, [values, onUpdate]);
  
  // Obsługa zmiany pola
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };
  
  // Obsługa otwierania pickera kolorów
  const handleOpenColorPicker = (field) => {
    setCurrentColorField(field);
    setColorPickerOpen(true);
  };
  
  // Obsługa zamykania pickera kolorów
  const handleCloseColorPicker = () => {
    setColorPickerOpen(false);
  };
  
  // Obsługa zmiany koloru
  const handleColorChange = (newColor) => {
    setValues({ ...values, [currentColorField]: newColor });
  };
  
  // Obsługa przesyłania logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Utwórz podgląd pliku
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        // W prawdziwej aplikacji wysłalibyśmy plik na serwer
        // i zaktualizowali wartość logoUrl
        setValues({ ...values, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Usuń logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl('');
    setValues({ ...values, logoUrl: '' });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wygląd dropu
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle1" gutterBottom>
            Kolory
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kolor nagłówka"
                value={values.headerColor}
                onChange={handleChange('headerColor')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: values.headerColor,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenColorPicker('headerColor')}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Kolor przycisków"
                value={values.buttonColor}
                onChange={handleChange('buttonColor')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: values.buttonColor,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenColorPicker('buttonColor')}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kolor tekstu"
                value={values.fontColor}
                onChange={handleChange('fontColor')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: values.fontColor,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenColorPicker('fontColor')}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Kolor tła"
                value={values.backgroundColor}
                onChange={handleChange('backgroundColor')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: values.backgroundColor,
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenColorPicker('backgroundColor')}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
            Logo
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Prześlij logo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoUpload}
              />
            </Button>
            
            {previewUrl && (
              <IconButton 
                color="error" 
                onClick={handleRemoveLogo}
                sx={{ ml: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          
          {previewUrl ? (
            <Card sx={{ maxWidth: 300, mb: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image={previewUrl}
                alt="Logo podgląd"
                sx={{ objectFit: 'contain' }}
              />
            </Card>
          ) : (
            <Box 
              sx={{ 
                border: '1px dashed #ccc', 
                p: 2, 
                textAlign: 'center',
                maxWidth: 300,
                mb: 2
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 48, color: '#ccc' }} />
              <Typography variant="body2" color="text.secondary">
                Brak przesłanego logo
              </Typography>
            </Box>
          )}
          
          <FormHelperText>
            Zalecany rozmiar: 200x50 pikseli, format PNG lub SVG z przezroczystym tłem
          </FormHelperText>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" gutterBottom>
            Podgląd
          </Typography>
          
          <Paper 
            elevation={2} 
            sx={{ 
              overflow: 'hidden',
              borderRadius: 1,
              mb: 3,
            }}
          >
            {/* Nagłówek */}
            <Box sx={{ 
              bgcolor: values.headerColor, 
              p: 2, 
              color: '#fff',
              display: 'flex',
              alignItems: 'center'
            }}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Logo" 
                  style={{ 
                    height: 30, 
                    marginRight: '10px',
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Nazwa Dropu
                </Typography>
              )}
            </Box>
            
            {/* Treść */}
            <Box sx={{ 
              bgcolor: values.backgroundColor, 
              p: 2, 
              minHeight: 200,
              color: values.fontColor
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                T-shirt "Summer Vibes"
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Kategoria: Odzież
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                99 zł
              </Typography>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: values.buttonColor,
                  '&:hover': {
                    bgcolor: values.buttonColor,
                    opacity: 0.9
                  }
                }}
              >
                Kup Teraz
              </Button>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="text.secondary">
            Powyżej znajduje się przybliżony podgląd wyglądu strony dropu. Rzeczywisty wygląd może się nieznacznie różnić.
          </Typography>
        </Grid>
      </Grid>
      
      {/* Dialog z color pickerem */}
      <Dialog open={colorPickerOpen} onClose={handleCloseColorPicker}>
        <DialogTitle>Wybierz kolor</DialogTitle>
        <DialogContent>
          <HexColorPicker
            color={values[currentColorField] || '#ffffff'}
            onChange={handleColorChange}
          />
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Kod koloru"
              value={values[currentColorField] || ''}
              onChange={handleChange(currentColorField)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseColorPicker}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DropAppearance;
