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
  Chip,
  Stepper,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { getOrder, generateInvoice, updateOrderStatus, cancelOrder, addOrderNote } from '../../services/orderService';
import { formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import OrderDetails from '../../components/Orders/OrderDetails';
import OrderStatusStepper from '../../components/Orders/OrderStatusStepper';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Pobierz szczegóły zamówienia
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrder(id);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Nie udało się pobrać danych zamówienia');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Wystąpił błąd podczas pobierania danych zamówienia');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  // Obsługa zmiany statusu zamówienia
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await updateOrderStatus(id, newStatus);
      
      if (response.success) {
        setOrder({
          ...order,
          status: newStatus
        });
        
        toast.success(`Status zamówienia został zmieniony na: ${newStatus}`);
      } else {
        toast.error(response.message || 'Błąd podczas zmiany statusu zamówienia');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Wystąpił błąd podczas zmiany statusu zamówienia');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Obsługa generowania faktury
  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      const response = await generateInvoice(id);
      
      if (response.success && response.data.invoiceUrl) {
        // Otwórz fakturę w nowym oknie
        window.open(response.data.invoiceUrl, '_blank');
        
        toast.success('Faktura została wygenerowana pomyślnie');
      } else {
        toast.error(response.message || 'Błąd podczas generowania faktury');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Wystąpił błąd podczas generowania faktury');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Obsługa anulowania zamówienia
  const handleCancelOrder = () => {
    setCancelDialogOpen(true);
  };
  
  const confirmCancelOrder = async () => {
    try {
      setUpdatingStatus(true);
      const response = await cancelOrder(id, cancelReason);
      
      if (response.success) {
        setOrder({
          ...order,
          status: 'cancelled'
        });
        
        toast.success('Zamówienie zostało anulowane');
        setCancelDialogOpen(false);
        setCancelReason('');
      } else {
        toast.error(response.message || 'Błąd podczas anulowania zamówienia');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Wystąpił błąd podczas anulowania zamówienia');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Obsługa dodawania notatki
  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      setAddingNote(true);
      const response = await addOrderNote(id, note);
      
      if (response.success) {
        setOrder({
          ...order,
          notes: [...(order.notes || []), { content: note, createdAt: new Date() }]
        });
        
        toast.success('Notatka została dodana pomyślnie');
        setNote('');
      } else {
        toast.error(response.message || 'Błąd podczas dodawania notatki');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Wystąpił błąd podczas dodawania notatki');
    } finally {
      setAddingNote(false);
    }
  };

  const breadcrumbs = [
    { label: 'Zamówienia', path: '/orders' },
    { label: order ? `Zamówienie #${order.orderNumber}` : 'Szczegóły zamówienia' }
  ];

  return (
    <Box>
      <PageHeader 
        title={order ? `Zamówienie #${order.orderNumber}` : 'Szczegóły zamówienia'} 
        breadcrumbs={breadcrumbs}
      />
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
        >
          Powrót do listy zamówień
        </Button>
        
        {order && order.status !== 'cancelled' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleCancelOrder}
            disabled={updatingStatus}
          >
            Anuluj zamówienie
          </Button>
        )}
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
          {/* Przyciski Akcji */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
              >
                Generuj fakturę
              </Button>
            </Grid>
            
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => window.location.href = `mailto:${order.customer.email}`}
              >
                Email do klienta
              </Button>
            </Grid>
            
            {order.status === 'paid' && (
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<ShippingIcon />}
                  onClick={() => handleStatusChange('shipped')}
                  disabled={updatingStatus}
                  color="primary"
                >
                  Oznacz jako wysłane
                </Button>
              </Grid>
            )}
            
            {order.status === 'shipped' && (
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => handleStatusChange('delivered')}
                  disabled={updatingStatus}
                  color="primary"
                >
                  Oznacz jako dostarczone
                </Button>
              </Grid>
            )}
          </Grid>
          
          {/* Komponent OrderDetails */}
          <OrderDetails 
            order={order} 
            onGenerateInvoice={handleGenerateInvoice} 
          />
          
          {/* Notatki do zamówienia */}
          <Paper elevation={0} sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Notatki wewnętrzne
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dodaj notatkę"
                  multiline
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  onClick={handleAddNote}
                  disabled={addingNote || !note.trim()}
                >
                  Dodaj notatkę
                </Button>
              </Grid>
            </Grid>
            
            {order.notes && order.notes.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {order.notes.map((note, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: '#f8f9fa' }} variant="outlined">
                    <CardContent>
                      <Typography variant="body2">{note.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dodano: {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <Typography variant="body2">
                  Brak notatek do tego zamówienia
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}
      
      {/* Dialog anulowania zamówienia */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Anulowanie zamówienia"
        message="Czy na pewno chcesz anulować to zamówienie? Ta operacja jest nieodwracalna."
        confirmLabel="Anuluj zamówienie"
        cancelLabel="Wróć"
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={confirmCancelOrder}
        maxWidth="sm"
        confirmColor="error"
      >
        <TextField
          fullWidth
          margin="dense"
          label="Powód anulowania"
          multiline
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          sx={{ mt: 2 }}
        />
      </ConfirmDialog>
    </Box>
  );
};

export default OrderDetailsPage;