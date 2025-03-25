// seller-panel/src/pages/Drops/NewDrop.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Paper,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { pl } from 'date-fns/locale';
import { createDrop, publishDrop } from '../../services/dropService';
import { useAuth } from '../../contexts/AuthContext';
import ProductSelection from '../../components/Drops/ProductSelection';
import DropAvailability from '../../components/Drops/DropAvailability';
import DropAppearance from '../../components/Drops/DropAppearance';
import DropSummary from '../../components/Drops/DropSummary';

// Walidacja - krok 1
const basicInfoSchema = yup.object().shape({
  name: yup.string().required('Nazwa dropu jest wymagana').max(100, 'Nazwa może mieć maksymalnie 100 znaków'),
  description: yup.string().max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
  startDate: yup.date().required('Data rozpoczęcia jest wymagana').min(new Date(), 'Data musi być w przyszłości'),
  timeLimit: yup.number().required('Czas na złożenie zamówienia jest wymagany')
    .min(1, 'Minimalny czas to 1 minuta').max(120, 'Maksymalny czas to 120 minut')
});

const steps = ['Podstawowe informacje', 'Produkty', 'Dostępność', 'Wygląd', 'Podsumowanie'];

const NewDrop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropData, setDropData] = useState({
    name: '',
    description: '',
    startDate: null,
    timeLimit: 10,
    products: [],
    status: 'draft',
    customization: {
      headerColor: '#1a1a2e',
      buttonColor: '#4CAF50',
      fontColor: '#333333',
      backgroundColor: '#f8f9fa',
      logoUrl: ''
    }
  });

  // React Hook Form dla podstawowych informacji
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      name: dropData.name,
      description: dropData.description,
      startDate: dropData.startDate,
      timeLimit: dropData.timeLimit
    }
  });

  const handleNext = () => {
    if (activeStep === 0) {
      handleSubmit(onBasicInfoSubmit)();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onBasicInfoSubmit = (data) => {
    setDropData(prev => ({ ...prev, ...data }));
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleProductsUpdate = (selectedProducts) => {
    setDropData(prev => ({ ...prev, products: selectedProducts }));
  };

  const handleAvailabilityUpdate = (availabilityData) => {
    setDropData(prev => ({ ...prev, ...availabilityData }));
  };

  const handleAppearanceUpdate = (customization) => {
    setDropData(prev => ({ ...prev, customization }));
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      await createDrop({
        ...dropData,
        seller: user.id,
        status: 'draft'
      });
      toast.success('Drop został zapisany jako szkic');
      navigate('/drops');
    } catch (error) {
      console.error('Error saving drop:', error);
      toast.error('Błąd podczas zapisywania dropu');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      // Najpierw tworzymy drop jako szkic
      const response = await createDrop({
        ...dropData,
        seller: user.id,
        status: 'draft'
      });
      
      // Następnie publikujemy go
      if (response.data) {
        await publishDrop(response.data._id);
        toast.success('Drop został opublikowany pomyślnie');
        navigate('/drops');
      }
    } catch (error) {
      console.error('Error publishing drop:', error);
      toast.error('Błąd podczas publikowania dropu');
    } finally {
      setLoading(false);
    }
  };

  // Renderowanie odpowiedniego kroku
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" noValidate>
            <Typography variant="h6" gutterBottom>
              Podstawowe informacje o dropie
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nazwa dropu"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opis dropu"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        label="Data i godzina rozpoczęcia"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="timeLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Czas na złożenie zamówienia"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 1, max: 120 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">minut</InputAdornment>,
                      }}
                      error={!!errors.timeLimit}
                      helperText={errors.timeLimit?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <ProductSelection 
            selectedProducts={dropData.products} 
            onProductsChange={handleProductsUpdate} 
          />
        );
      case 2:
        return (
          <DropAvailability 
            data={dropData} 
            onUpdate={handleAvailabilityUpdate} 
          />
        );
      case 3:
        return (
          <DropAppearance 
            customization={dropData.customization} 
            onUpdate={handleAppearanceUpdate} 
          />
        );
      case 4:
        return (
          <DropSummary 
            data={dropData} 
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nowy Drop
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Wstecz
          </Button>
          
          <Box>
            {activeStep !== steps.length - 1 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSaveAsDraft}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Zapisz szkic'}
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Zapisz jako szkic
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePublish}
                  disabled={loading}
                  color="primary"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Opublikuj drop'}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Dalej
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewDrop;
