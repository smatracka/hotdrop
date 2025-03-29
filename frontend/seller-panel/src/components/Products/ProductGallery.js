import React, { useState } from 'react';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardMedia,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { uploadProductImage } from '../../services/productService';

const ProductGallery = ({ images = [], onChange, productId = null, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Obsługa przesyłania pliku
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Sprawdź limit liczby zdjęć
    if (images.length >= maxImages) {
      setError(`Możesz przesłać maksymalnie ${maxImages} zdjęć`);
      return;
    }
    
    // Sprawdź typ pliku
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Dozwolone są tylko pliki obrazów (JPG, PNG, WEBP, GIF)');
      return;
    }
    
    // Sprawdź rozmiar pliku (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Maksymalny rozmiar pliku to 5MB');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      let imageUrl;
      
      // Jeśli mamy ID produktu, prześlij plik na serwer
      if (productId) {
        const response = await uploadProductImage(productId, file);
        imageUrl = response.data.imageUrl;
      } else {
        // W przeciwnym razie utwórz lokalny URL
        imageUrl = URL.createObjectURL(file);
      }
      
      // Aktualizuj listę zdjęć
      const updatedImages = [...images, imageUrl];
      onChange(updatedImages);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Błąd podczas przesyłania pliku. Spróbuj ponownie.');
    } finally {
      setUploading(false);
    }
  };
  
  // Obsługa usunięcia zdjęcia
  const handleImageDelete = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onChange(updatedImages);
  };
  
  // Obsługa przeciągania zdjęć (zmiana kolejności)
  const handleDragEnd = (result) => {
    // Sprawdź, czy przeciągnięcie zakończyło się w dozwolonym obszarze
    if (!result.destination) return;
    
    const newImages = Array.from(images);
    const [reorderedItem] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, reorderedItem);
    
    onChange(newImages);
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="product-images" direction="horizontal">
          {(provided) => (
            <Grid 
              container 
              spacing={2} 
              ref={provided.innerRef} 
              {...provided.droppableProps}
            >
              {/* Istniejące zdjęcia */}
              {images.map((imageUrl, index) => (
                <Draggable key={index} draggableId={`image-${index}`} index={index}>
                  {(provided) => (
                    <Grid 
                      item 
                      xs={6} 
                      sm={4} 
                      md={3} 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="150"
                          image={imageUrl}
                          alt={`Zdjęcie produktu ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                            }
                          }}
                          onClick={() => handleImageDelete(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        {index === 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              textAlign: 'center',
                              padding: '4px'
                            }}
                          >
                            Zdjęcie główne
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  )}
                </Draggable>
              ))}
              
              {/* Pole dodawania nowego zdjęcia */}
              {images.length < maxImages && (
                <Grid item xs={6} sm={4} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: 150,
                      border: '2px dashed #ccc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    component="label"
                  >
                    {uploading ? (
                      <CircularProgress size={40} />
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Dodaj zdjęcie
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
              )}
              
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Możesz dodać maksymalnie {maxImages} zdjęć. Przeciągnij zdjęcia, aby zmienić ich kolejność.
        Pierwsze zdjęcie będzie głównym zdjęciem produktu.
      </Typography>
    </Box>
  );
};

export default ProductGallery;
