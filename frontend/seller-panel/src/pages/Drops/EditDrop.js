import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Divider,
  Grid,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { getDrop, updateDrop, publishDrop } from '../../services/dropService';
import { dropSchema } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';
import DropAvailability from '../../components/Drops/DropAvailability';
import DropAppearance from '../../components/Drops/DropAppearance';
import ProductSelection from '../../components/Drops/ProductSelection';
import DropSummary from '../../components/Drops/DropSummary';

const EditDrop = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [dropData, setDropData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pobierz dane dropu
  useEffect(() => {
    const fetchDrop = async () => {
      try {
        setLoading(true);
        const response = await getDrop(id);
        
        if (response.success) {
          setDropData(response.data);
        } else {
          setError('Nie udało się pobrać danych dropu');
        }
      } catch (error) {
        console.error('Error fetching drop:', error);
        setError('Wystąpił błąd podczas pobierania danych dropu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrop();
  }, [id]);
  
  // Funkcja zapisująca zmiany
  const handleSave = async (updatedData) => {
    try {
      setSaving(true);
      setError('');
      
      const data = {
        ...updatedData,
        seller: user.id
      };
      
      const response = await updateDrop(id, data);
      
      if (response.success) {
        toast.success('Drop został zaktualizowany pomyślnie');
        setDropData(response.data);
        return true;
      } else {
        toast.error(response.message || 'Błąd podczas aktualizacji dropu');
        return false;
      }
    } catch (error) {
      console.error('Error updating drop:', error);
      toast.error('Wystąpił błąd podczas aktualizacji dropu');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  // Obsługa aktualizacji podstawowych informacji
  const handleBasicInfoUpdate = async (data) => {
    return await handleSave({
      ...dropData,
      name: data.name,
      description: data.description,
      timeLimit: data.timeLimit
    });
  };
  
  // Obsługa aktualizacji produktów
  const handleProductsUpdate = async (selectedProducts) => {
    return await handleSave({
      ...dropData,
      products: selectedProducts
    });
  };
  
  // Obsługa aktualizacji dostępności
  const handleAvailabilityUpdate = async (availabilityData) => {
    return await handleSave({
      ...dropData,
      ...availabilityData
    });
  };
  
  // Obsługa aktualizacji wyglądu
  const handleAppearanceUpdate = async (customization) => {
    return await handleSave({
      ...dropData,
      customization
    });
  };
  
  // Obsługa publikowania dropu
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError('');
      
      const response = await publishDrop(id);
      
      if (response.success) {
        toast.success('Drop został opublikowany pomyślnie');
        setDropData({
          ...dropData,
          status: 'published'
        });
        navigate('/drops');
      } else {
        toast.error(response.message || 'Błąd podczas publikowania dropu');
      }
    } catch (error) {
      console.error('Error publishing drop:', error);
      toast.error('Wystąpił błąd podczas publikowania dropu');
    } finally {
      setPublishing(false);
    }
  };
  
  // Zmiana aktywnej zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const breadcrumbs = [
    { label: 'Dropy', path: '/drops' },
    { label: dropData ? dropData.name : 'Edycja dropu' }
  ];
  
  // Sprawdź, czy drop może być opublikowany
  const canPublish = dropData && 
                    dropData.status === 'draft' && 
                    dropData.products && 
                    dropData.products.length > 0 && 
                    dropData.startDate;
  
  if (loading) {
    return (
      <Box>
        <PageHeader 
          title="Edycja dropu" 
          breadcrumbs={breadcrumbs}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <PageHeader 
          title="Edycja dropu" 
          breadcrumbs={breadcrumbs}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/drops')}
        >
          Powrót do listy dropów
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <PageHeader 
        title={`Edycja: ${dropData.name}`} 
        breadcrumbs={breadcrumbs}
      />
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/drops')}
        >
          Powrót do listy dropów
        </Button>
        
        {canPublish && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? <CircularProgress size={24} color="inherit" /> : 'Opublikuj drop'}
          </Button>
        )}
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Podstawowe informacje" />
          <Tab label="Produkty" />
          <Tab label="Dostępność" />
          <Tab label="Wygląd" />
          <Tab label="Podsumowanie" />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && (
          <Box component="form">
            <Typography variant="h6" gutterBottom>
              Podstawowe informacje o dropie
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nazwa dropu"
                  fullWidth
                  required
                  defaultValue={dropData.name}
                  onBlur={(e) => handleBasicInfoUpdate({ ...dropData, name: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Opis dropu"
                  fullWidth
                  multiline
                  rows={4}
                  defaultValue={dropData.description}
                  onBlur={(e) => handleBasicInfoUpdate({ ...dropData, description: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Czas na złożenie zamówienia"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: 1, max: 120 }}
                  defaultValue={dropData.timeLimit}
                  onBlur={(e) => handleBasicInfoUpdate({ ...dropData, timeLimit: parseInt(e.target.value) })}
                  helperText="Czas w minutach, przez który klient może finalizować zakup po dodaniu produktu do koszyka"
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {activeTab === 1 && (
          <ProductSelection 
            selectedProducts={dropData.products || []} 
            onProductsChange={handleProductsUpdate} 
          />
        )}
        
        {activeTab === 2 && (
          <DropAvailability 
            data={dropData} 
            onUpdate={handleAvailabilityUpdate} 
          />
        )}
        
        {activeTab === 3 && (
          <DropAppearance 
            customization={dropData.customization || {}} 
            onUpdate={handleAppearanceUpdate} 
          />
        )}
        
        {activeTab === 4 && (
          <DropSummary 
            data={dropData} 
          />
        )}
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          disabled={activeTab === 0}
          onClick={() => setActiveTab(prev => prev - 1)}
        >
          Poprzednia sekcja
        </Button>
        
        {activeTab < 4 ? (
          <Button
            variant="contained"
            onClick={() => setActiveTab(prev => prev + 1)}
          >
            Następna sekcja
          </Button>
        ) : canPublish && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? <CircularProgress size={24} color="inherit" /> : 'Opublikuj drop'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EditDrop;