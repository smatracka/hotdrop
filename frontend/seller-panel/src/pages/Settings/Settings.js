import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { profileSchema, changePasswordSchema } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // React Hook Form dla danych profilu
  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      company: {
        name: user?.company?.name || '',
        vatId: user?.company?.vatId || '',
        address: {
          street: user?.company?.address?.street || '',
          city: user?.company?.address?.city || '',
          postalCode: user?.company?.address?.postalCode || '',
          country: user?.company?.address?.country || 'Polska'
        }
      }
    }
  });

  // React Hook Form dla zmiany hasła
  const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Obsługa zmiany zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Obsługa aktualizacji profilu
  const onProfileSubmit = async (data) => {
    try {
      setSavingProfile(true);
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success('Profil został zaktualizowany pomyślnie');
      } else {
        toast.error(result.message || 'Wystąpił błąd podczas aktualizacji profilu');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Wystąpił błąd podczas aktualizacji profilu');
    } finally {
      setSavingProfile(false);
    }
  };

  // Obsługa zmiany hasła
  const onPasswordSubmit = async (data) => {
    try {
      setSavingPassword(true);
      const result = await changePassword(data.currentPassword, data.newPassword);
      
      if (result.success) {
        toast.success('Hasło zostało zmienione pomyślnie');
        resetPasswordForm();
      } else {
        toast.error(result.message || 'Wystąpił błąd podczas zmiany hasła');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Wystąpił błąd podczas zmiany hasła');
    } finally {
      setSavingPassword(false);
    }
  };

  // Nagłówek strony
  const breadcrumbs = [
    { label: 'Ustawienia' }
  ];

  return (
    <Box>
      <PageHeader 
        title="Ustawienia" 
        breadcrumbs={breadcrumbs}
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profil" />
          <Tab label="Zmiana hasła" />
          <Tab label="Powiadomienia" />
          <Tab label="Integracje" />
        </Tabs>
      </Paper>
      
      {/* Zawartość zakładki Profil */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dane profilu
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Imię i nazwisko"
                      fullWidth
                      required
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      required
                      error={!!profileErrors.email}
                      helperText={profileErrors.email?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
                  Dane firmy
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="company.name"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nazwa firmy"
                      fullWidth
                      required
                      error={!!profileErrors.company?.name}
                      helperText={profileErrors.company?.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="company.vatId"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="NIP"
                      fullWidth
                      required
                      error={!!profileErrors.company?.vatId}
                      helperText={profileErrors.company?.vatId?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
                  Adres
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="company.address.street"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ulica i numer"
                      fullWidth
                      required
                      error={!!profileErrors.company?.address?.street}
                      helperText={profileErrors.company?.address?.street?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="company.address.postalCode"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kod pocztowy"
                      fullWidth
                      required
                      error={!!profileErrors.company?.address?.postalCode}
                      helperText={profileErrors.company?.address?.postalCode?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="company.address.city"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Miasto"
                      fullWidth
                      required
                      error={!!profileErrors.company?.address?.city}
                      helperText={profileErrors.company?.address?.city?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="company.address.country"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kraj"
                      fullWidth
                      required
                      error={!!profileErrors.company?.address?.country}
                      helperText={profileErrors.company?.address?.country?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={savingProfile ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={savingProfile}
              >
                Zapisz zmiany
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Zawartość zakładki Zmiana hasła */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Zmiana hasła
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Hasło musi zawierać co najmniej 8 znaków, w tym co najmniej jedną dużą literę, jedną małą literę, jedną cyfrę i jeden znak specjalny.
          </Alert>
          
          <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Aktualne hasło"
                      fullWidth
                      required
                      type={showPassword ? 'text' : 'password'}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nowe hasło"
                      fullWidth
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Potwierdź nowe hasło"
                      fullWidth
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={savingPassword ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={savingPassword}
              >
                Zmień hasło
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Zawartość zakładki Powiadomienia */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ustawienia powiadomień
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Powiadomienia email
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Nowe zamówienia"
              />
              <br />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Zamówienia anulowane"
              />
              <br />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Informacje o dropach"
              />
              <br />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Raporty (tygodniowe podsumowanie)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Powiadomienia w aplikacji
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Wszystkie aktywności"
              />
              <br />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Niski stan magazynowy"
              />
              <br />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Aktualności i nowości"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
            >
              Zapisz ustawienia
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Zawartość zakładki Integracje */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Integracje
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Zintegruj swoje konto z zewnętrznymi serwisami, aby rozszerzyć funkcjonalność platformy.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Bramki płatności
              </Typography>
              
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="subtitle2">BLIK</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Główna metoda płatności dla szybkich zakupów
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Button variant="outlined" color="primary">
                      Konfiguruj
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Systemy logistyczne
              </Typography>
              
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="subtitle2">Integracja logistyczna</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatyzacja procesu wysyłki i śledzenia przesyłek
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Button variant="outlined">
                      Podłącz
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                API i Webhooks
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="webhook-type-label">Typ webhooka</InputLabel>
                <Select
                  labelId="webhook-type-label"
                  value=""
                  label="Typ webhooka"
                >
                  <MenuItem value="orders">Zamówienia</MenuItem>
                  <MenuItem value="customers">Klienci</MenuItem>
                  <MenuItem value="products">Produkty</MenuItem>
                  <MenuItem value="drops">Dropy</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="URL webhooka"
                placeholder="https://example.com/webhook"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ textAlign: 'right' }}>
                <Button variant="contained" color="primary">
                  Dodaj webhook
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;