import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCustomer, exportCustomerData, deleteCustomerData, getCustomerPurchaseHistory } from '../../services/customerService';
import PageHeader from '../../components/common/PageHeader';
import CustomerInfo from '../../components/Customers/CustomerInfo';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pobierz dane klienta
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const response = await getCustomer(id);
        
        if (response.success) {
          // Dodatkowo pobierz historię zakupów
          const historyResponse = await getCustomerPurchaseHistory(id);
          
          if (historyResponse.success) {
            setCustomer({
              ...response.data,
              orders: historyResponse.data
            });
          } else {
            setCustomer(response.data);
          }
        } else {
          setError('Nie udało się pobrać danych klienta');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError('Wystąpił błąd podczas pobierania danych klienta');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id]);
  
  // Obsługa eksportu danych klienta (RODO)
  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const response = await exportCustomerData(id);
      
      if (response.success) {
        // Tworzymy plik do pobrania
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        
        // Tworzymy link do pobrania i klikamy w niego
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer_data_${id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Dane klienta zostały wyeksportowane');
      } else {
        toast.error(response.message || 'Nie udało się wyeksportować danych klienta');
      }
    } catch (error) {
      console.error('Error exporting customer data:', error);
      toast.error('Wystąpił błąd podczas eksportowania danych klienta');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Obsługa usunięcia danych klienta (RODO)
  const handleDeleteData = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteData = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteCustomerData(id);
      
      if (response.success) {
        toast.success('Dane klienta zostały usunięte');
        navigate('/customers');
      } else {
        toast.error(response.message || 'Nie udało się usunąć danych klienta');
      }
    } catch (error) {
      console.error('Error deleting customer data:', error);
      toast.error('Wystąpił błąd podczas usuwania danych klienta');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Zmiana aktywnej zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const breadcrumbs = [
    { label: 'Klienci', path: '/customers' },
    { label: customer ? customer.name : 'Szczegóły klienta' }
  ];
  
  return (
    <Box>
      <PageHeader 
        title={customer ? `Klient: ${customer.name}` : 'Szczegóły klienta'} 
        breadcrumbs={breadcrumbs}
      />
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customers')}
        >
          Powrót do listy klientów
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            disabled={exportLoading || !customer}
            sx={{ mr: 1 }}
          >
            Eksportuj dane (RODO)
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteData}
            disabled={deleteLoading || !customer}
          >
            Usuń dane (RODO)
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Informacje" />
              <Tab label="Zamówienia" />
              <Tab label="Komunikacja" />
            </Tabs>
          </Paper>
          
          {activeTab === 0 && (
            <CustomerInfo 
              customer={customer} 
              onExportData={handleExportData} 
              onDeleteData={handleDeleteData} 
            />
          )}
          
          {activeTab === 1 && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historia zamówień
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {customer.ordersCount === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Klient nie złożył jeszcze żadnego zamówienia.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {/* Zawartość zostanie dodana w przyszłości - teraz używamy komponentu CustomerInfo */}
                </Box>
              )}
            </Paper>
          )}
          
          {activeTab === 2 && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historia komunikacji
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Historia komunikacji będzie dostępna w przyszłych wersjach.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      )}
      
      {/* Dialog potwierdzenia usunięcia danych */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Potwierdź usunięcie danych"
        message="Czy na pewno chcesz usunąć dane tego klienta? Ta operacja jest nieodwracalna i zgodna z wymogami RODO. Wszystkie dane osobowe zostaną usunięte lub zanonimizowane."
        confirmLabel="Usuń dane"
        cancelLabel="Anuluj"
        onConfirm={confirmDeleteData}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleteLoading}
        confirmColor="error"
      />
    </Box>
  );
};

export default CustomerDetails;