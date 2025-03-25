// frontend/seller-panel/src/components/Drops/DropAvailability.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  InputAdornment,
  Paper,
  Switch,
  Alert,
  Collapse,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import { format, addMinutes, addHours, addDays, isAfter } from 'date-fns';

const DropAvailability = ({ data, onUpdate }) => {
  const [availabilityType, setAvailabilityType] = useState(data.startDate ? 'scheduled' : 'immediate');
  const [startDate, setStartDate] = useState(data.startDate || new Date());
  const [endDate, setEndDate] = useState(
    data.endDate || addMinutes(data.startDate || new Date(), data.timeLimit || 10)
  );
  const [showCustomEndDate, setShowCustomEndDate] = useState(!!data.endDate);
  const [notifyCustomers, setNotifyCustomers] = useState(true);
  const [visibilityBefore, setVisibilityBefore] = useState(data.visibilityBefore || false);
  
  const [dateError, setDateError] = useState('');

  // Obsługa zmiany typu dostępności
  const handleAvailabilityTypeChange = (event) => {
    const newType = event.target.value;
    setAvailabilityType(newType);
    
    if (newType === 'immediate') {
      // Ustaw datę rozpoczęcia na teraz
      const now = new Date();
      setStartDate(now);
      setEndDate(addMinutes(now, data.timeLimit || 10));
    }
  };
  
  // Obsługa zmiany daty rozpoczęcia
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    
    if (!showCustomEndDate) {
      // Automatycznie zaktualizuj datę zakończenia
      setEndDate(addMinutes(newDate, data.timeLimit || 10));
    } else if (isAfter(endDate, newDate)) {
      setDateError('');
    } else {
      setDateError('Data zakończenia musi być późniejsza niż data rozpoczęcia');
    }
  };
  
  // Obsługa zmiany daty zakończenia
  const handleEndDateChange = (newDate) => {
    if (isAfter(newDate, startDate)) {
      setEndDate(newDate);
      setDateError('');
    } else {
      setDateError('Data zakończenia musi być późniejsza niż data rozpoczęcia');
    }
  };
  
  // Obsługa przełączenia własnej daty zakończenia
  const handleCustomEndDateToggle = (event) => {
    const checked = event.target.checked;
    setShowCustomEndDate(checked);
    
    if (!checked) {
      // Jeśli wyłączono, oblicz ponownie datę końcową na podstawie czasu trwania
      setEndDate(addMinutes(startDate, data.timeLimit || 10));
    }
  };
  
  // Zaktualizuj dane przy każdej zmianie
  React.useEffect(() => {
    const updateData = {
      startDate,
      ...(showCustomEndDate ? { endDate } : {})
    };
    
    onUpdate(updateData);
  }, [startDate, endDate, showCustomEndDate, onUpdate]);
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dostępność dropu
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Kiedy drop ma być dostępny?
            </Typography>
            <RadioGroup
              aria-label="availability-type"
              name="availability-type"
              value={availabilityType}
              onChange={handleAvailabilityTypeChange}
            >
              <FormControlLabel 
                value="immediate" 
                control={<Radio />} 
                label="Natychmiast po opublikowaniu" 
              />
              <FormControlLabel 
                value="scheduled" 
                control={<Radio />} 
                label="W zaplanowanym terminie" 
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {availabilityType === 'scheduled' && (
          <>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                <DateTimePicker
                  label="Data i godzina rozpoczęcia"
                  value={startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    }
                  }}
                />
              </LocalizationProvider>
              <FormHelperText>
                Drop będzie dostępny automatycznie o wybranej godzinie
              </FormHelperText>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={showCustomEndDate} 
                    onChange={handleCustomEndDateToggle}
                    color="primary"
                  />
                }
                label="Ustaw własną datę zakończenia dropu"
              />
              <FormHelperText>
                Domyślnie drop będzie trwał przez {data.timeLimit || 10} minut od rozpoczęcia
              </FormHelperText>
            </Grid>
            
            {showCustomEndDate && (
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                  <DateTimePicker
                    label="Data i godzina zakończenia"
                    value={endDate}
                    onChange={handleEndDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!dateError,
                        helperText: dateError
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            )}
          </>
        )}
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Opcje zaawansowane
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={visibilityBefore} 
                      onChange={(e) => setVisibilityBefore(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Pokaż produkty przed rozpoczęciem dropu"
                />
                <FormHelperText>
                  Użytkownicy będą mogli przeglądać produkty, ale nie będą mogli ich kupić przed rozpoczęciem dropu
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notifyCustomers} 
                      onChange={(e) => setNotifyCustomers(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Powiadom zapisanych klientów o rozpoczęciu dropu"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Collapse in={availabilityType === 'scheduled'}>
            <Alert severity="info" sx={{ mt: 2 }}>
              Drop rozpocznie się {format(startDate, 'dd.MM.yyyy o HH:mm')} i 
              {showCustomEndDate 
                ? ` zakończy się ${format(endDate, 'dd.MM.yyyy o HH:mm')}` 
                : ` będzie trwał ${data.timeLimit || 10} minut`}.
            </Alert>
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DropAvailability;
