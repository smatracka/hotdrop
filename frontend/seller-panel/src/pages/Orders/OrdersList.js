import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
  Assignment as AssignmentIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
  Payments as PaymentsIcon
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders } from '../../services/orderService';
import { formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

const OrdersList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30), // 30 dni wstecz
    endDate: new Date()
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [summaryData, setSummaryData] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Pobierz zamówienia
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders({
          sellerId: user.id,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          page,
          limit,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          sort: 'createdAt',
          order: 'desc'
        });

        if (response.success) {
          setOrders(response.data.docs || []);
          setTotalOrders(response.data.totalDocs || 0);
          
          // Oblicz podsumowanie zamówień dla każdego statusu
          if (response.data.summary) {
            setSummaryData(response.data.summary);
          } else {
            // Jeśli API nie zwraca podsumowania, oblicz ręcznie
            const summary = {
              total: response.data.totalDocs || 0,
              pending: 0,
              paid: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0
            };
            
            response.data.docs.forEach(order => {
              if (summary[order.status] !== undefined) {
                summary[order.status]++;
              }
            });
            
            setSummaryData(summary);
          }
        } else {
          console.error('Error fetching orders:', response.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.id, statusFilter, searchQuery, page, limit, dateRange]);

  // Kolumny dla tabeli
  const columns = [
    {
      id: 'orderNumber',
      label: 'Nr zamówienia',
      format: (value, row) => (
        <Typography
          component={RouterLink}
          to={`/orders/${row._id}`}
          variant="body2"
          color="primary"
          sx={{ textDecoration: 'none', fontWeight: 'medium' }}
        >
          {value}
        </Typography>
      )
    },
    {
      id: 'createdAt',
      label: 'Data',
      format: (value) => format(new Date(value), 'dd.MM.yyyy HH:mm')
    },
    {
      id: 'customer',
      label: 'Klient',
      format: (value) => value?.name || 'Nieznany'
    },
    {
      id: 'items',
      label: 'Produkty',
      format: (value) => value?.length || 0
    },
    {
      id: 'totalAmount',
      label: 'Wartość',
      format: (value) => formatPrice(value || 0)
    },
    {
      id: 'status',
      label: 'Status',
      format: (value) => <StatusBadge status={value} />
    },
    {
      id: 'paymentStatus',
      label: 'Płatność',
      format: (value) => <StatusBadge status={value} />
    }
  ];

  // Nagłówek strony
  const breadcrumbs = [
    { label: 'Zamówienia' }
  ];

  // Obsługa przejścia do szczegółów zamówienia
  const handleRowClick = (row) => {
    window.location.href = `/orders/${row._id}`;
  };

  // Obsługa eksportu zamówień do CSV
  const handleExportCSV = () => {
    // Implementacja eksportu do CSV
    toast.info('Eksport zamówień do CSV zostanie zaimplementowany w przyszłej wersji.');
  };

  // Obsługa szybkiego filtra daty
  const handleQuickDateFilter = (range) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(endDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    setDateRange({ startDate, endDate });
  };

  return (
    <Box>
      <PageHeader 
        title="Zamówienia" 
        breadcrumbs={breadcrumbs}
      />
      
      {/* Panel filtrowania */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Szukaj zamówień..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Wszystkie statusy</MenuItem>
                <MenuItem value="pending">Oczekujące</MenuItem>
                <MenuItem value="paid">Opłacone</MenuItem>
                <MenuItem value="shipped">Wysłane</MenuItem>
                <MenuItem value="delivered">Dostarczone</MenuItem>
                <MenuItem value="cancelled">Anulowane</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="date-filter-label">Okres</InputLabel>
              <Select
                labelId="date-filter-label"
                value=""
                label="Okres"
                onChange={(e) => handleQuickDateFilter(e.target.value)}
              >
                <MenuItem value="">Wybierz okres</MenuItem>
                <MenuItem value="today">Dzisiaj</MenuItem>
                <MenuItem value="yesterday">Wczoraj</MenuItem>
                <MenuItem value="week">Ostatni tydzień</MenuItem>
                <MenuItem value="month">Ostatni miesiąc</MenuItem>
                <MenuItem value="quarter">Ostatni kwartał</MenuItem>
                <MenuItem value="year">Ostatni rok</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Eksportuj CSV
            </Button>
          </Grid>
          
          {/* Wybór zakresu dat */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Od dnia"
                value={dateRange.startDate}
                onChange={(newDate) => setDateRange(prev => ({ ...prev, startDate: newDate }))}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Do dnia"
                value={dateRange.endDate}
                onChange={(newDate) => setDateRange(prev => ({ ...prev, endDate: newDate }))}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statystyki zamówień */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Wszystkie
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBagIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Oczekujące
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.pending || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentsIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Opłacone
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.paid || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShippingIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Wysłane
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.shipped || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Dostarczone
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.delivered || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterListIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Anulowane
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryData.cancelled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Lista zamówień */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Brak zamówień"
          description={
            searchQuery || statusFilter !== 'all'
              ? "Nie znaleziono zamówień pasujących do kryteriów wyszukiwania."
              : "Nie masz jeszcze żadnych zamówień."
          }
          icon={FilterListIcon}
          actionLabel={searchQuery || statusFilter !== 'all' ? "Wyczyść filtry" : null}
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          onRowClick={handleRowClick}
          rowsPerPageOptions={[10, 25, 50, 100]}
          defaultRowsPerPage={limit}
        />
      )}
    </Box>
  );
};

export default OrdersList;