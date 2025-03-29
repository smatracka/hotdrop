import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MailOutline as NewsletterIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomers } from '../../services/customerService';
import { formatDate, formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';

const CustomersList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Pobierz klientów
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await getCustomers({
          sellerId: user.id,
          search: searchQuery || undefined,
          page,
          limit,
          sort: sortBy,
          order: 'desc'
        });

        if (response.success) {
          setCustomers(response.data.docs || []);
          setTotalCustomers(response.data.totalDocs || 0);
        } else {
          console.error('Error fetching customers:', response.message);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user.id, searchQuery, sortBy, page, limit]);

  // Kolumny dla tabeli
  const columns = [
    {
      id: 'name',
      label: 'Klient',
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {value.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              component={RouterLink}
              to={`/customers/${row._id}`}
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', fontWeight: 'medium' }}
            >
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'createdAt',
      label: 'Data rejestracji',
      format: (value) => formatDate(value, 'short')
    },
    {
      id: 'ordersCount',
      label: 'Zamówienia',
      format: (value) => value || 0
    },
    {
      id: 'totalSpent',
      label: 'Wydatki',
      format: (value) => formatPrice(value || 0)
    },
    {
      id: 'lastOrder',
      label: 'Ostatni zakup',
      format: (value) => value ? formatDate(value, 'short') : 'Brak'
    },
    {
      id: 'consents',
      label: 'Zgody',
      format: (value) => (
        <Box>
          {value?.newsletter && (
            <Chip 
              icon={<NewsletterIcon fontSize="small" />} 
              label="Newsletter" 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ mr: 1 }}
            />
          )}
          {value?.marketing && (
            <Chip 
              icon={<EmailIcon fontSize="small" />} 
              label="Marketing" 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>
      )
    }
  ];

  // Nagłówek strony
  const breadcrumbs = [
    { label: 'Klienci' }
  ];

  // Obsługa przejścia do szczegółów klienta
  const handleRowClick = (row) => {
    window.location.href = `/customers/${row._id}`;
  };

  return (
    <Box>
      <PageHeader 
        title="Klienci" 
        breadcrumbs={breadcrumbs}
      />
      
      {/* Panel filtrowania */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Szukaj klientów..."
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
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sortuj według</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sortuj według"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="createdAt">Data rejestracji</MenuItem>
                <MenuItem value="name">Nazwa</MenuItem>
                <MenuItem value="ordersCount">Liczba zamówień</MenuItem>
                <MenuItem value="totalSpent">Wydatki</MenuItem>
                <MenuItem value="lastOrder">Ostatni zakup</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
            >
              Eksportuj
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statystyki klientów */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Łącznie klientów
              </Typography>
              <Typography variant="h4">
                {totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Nowych w tym miesiącu
              </Typography>
              <Typography variant="h4">
                {customers.filter(c => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Z newsletter'em
              </Typography>
              <Typography variant="h4">
                {customers.filter(c => c.consents?.newsletter).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Z marketingiem
              </Typography>
              <Typography variant="h4">
                {customers.filter(c => c.consents?.marketing).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Lista klientów */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : customers.length === 0 ? (
        <EmptyState
          title="Brak klientów"
          description={
            searchQuery
              ? "Nie znaleziono klientów pasujących do kryteriów wyszukiwania."
              : "Nie masz jeszcze żadnych klientów."
          }
          icon={FilterListIcon}
          actionLabel={searchQuery ? "Wyczyść filtry" : null}
          onAction={() => {
            setSearchQuery('');
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          onRowClick={handleRowClick}
          rowsPerPageOptions={[10, 25, 50]}
          defaultRowsPerPage={10}
        />
      )}
    </Box>
  );
};

export default CustomersList;