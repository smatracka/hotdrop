import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  ShoppingBasket as ProductIcon,
  Event as EventIcon,
  Assignment as OrderIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getSalesSummary, downloadReport } from '../../services/reportService';
import { formatPrice, formatDate } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';

const ReportsList = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 dni wstecz
    endDate: new Date()
  });
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Pobierz podsumowanie sprzedaży
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await getSalesSummary(user.id, {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        });

        if (response.success) {
          setSummaryData(response.data);
        } else {
          console.error('Error fetching sales summary:', response.message);
        }
      } catch (error) {
        console.error('Error fetching sales summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [user.id, dateRange]);

  // Obsługa pobrania raportu
  const handleDownloadReport = async (reportType) => {
    try {
      setDownloadingReport(true);
      const params = {
        sellerId: user.id,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        format: 'csv'
      };

      const blobData = await downloadReport(reportType, params);
      
      // Tworzymy link do pobrania pliku
      const url = window.URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${formatDate(new Date(), 'short').replace(/\./g, '')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${reportType} report:`, error);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Nagłówek strony
  const breadcrumbs = [
    { label: 'Raporty' }
  ];

  // Definicje raportów
  const reportTypes = [
    {
      id: 'sales',
      title: 'Raport sprzedaży',
      description: 'Szczegółowe dane o sprzedaży w wybranym okresie',
      icon: <TrendingUpIcon fontSize="large" color="primary" />,
      path: '/reports/sales'
    },
    {
      id: 'products',
      title: 'Raport produktów',
      description: 'Analiza popularności i sprzedaży produktów',
      icon: <ProductIcon fontSize="large" color="primary" />,
      path: '/reports/products'
    },
    {
      id: 'customers',
      title: 'Raport klientów',
      description: 'Informacje o aktywności i wartości klientów',
      icon: <GroupIcon fontSize="large" color="primary" />,
      path: '/reports/customers'
    },
    {
      id: 'drops',
      title: 'Raport dropów',
      description: 'Statystyki i efektywność dropów',
      icon: <EventIcon fontSize="large" color="primary" />,
      path: '/reports/drops'
    },
    {
      id: 'orders',
      title: 'Raport zamówień',
      description: 'Analiza zamówień i statusów realizacji',
      icon: <OrderIcon fontSize="large" color="primary" />,
      path: '/reports/orders'
    }
  ];

  return (
    <Box>
      <PageHeader 
        title="Raporty" 
        breadcrumbs={breadcrumbs}
      />
      
      {/* Panel wyboru zakresu dat */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Data początkowa"
                value={dateRange.startDate}
                onChange={(newDate) => setDateRange(prev => ({ ...prev, startDate: newDate }))}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Data końcowa"
                value={dateRange.endDate}
                onChange={(newDate) => setDateRange(prev => ({ ...prev, endDate: newDate }))}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="quick-date-range-label">Szybki wybór</InputLabel>
              <Select
                labelId="quick-date-range-label"
                label="Szybki wybór"
                value=""
                onChange={(e) => {
                  const now = new Date();
                  let startDate = new Date();
                  
                  switch (e.target.value) {
                    case 'today':
                      startDate = new Date(now.setHours(0, 0, 0, 0));
                      break;
                    case 'yesterday':
                      startDate = new Date(now.setDate(now.getDate() - 1));
                      startDate.setHours(0, 0, 0, 0);
                      break;
                    case 'week':
                      startDate = new Date(now.setDate(now.getDate() - 7));
                      break;
                    case 'month':
                      startDate = new Date(now.setMonth(now.getMonth() - 1));
                      break;
                    case 'quarter':
                      startDate = new Date(now.setMonth(now.getMonth() - 3));
                      break;
                    case 'year':
                      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                      break;
                    default:
                      break;
                  }
                  
                  setDateRange({
                    startDate,
                    endDate: new Date()
                  });
                }}
              >
                <MenuItem value="today">Dzisiaj</MenuItem>
                <MenuItem value="yesterday">Wczoraj</MenuItem>
                <MenuItem value="week">Ostatni tydzień</MenuItem>
                <MenuItem value="month">Ostatni miesiąc</MenuItem>
                <MenuItem value="quarter">Ostatni kwartał</MenuItem>
                <MenuItem value="year">Ostatni rok</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Podsumowanie sprzedaży */}
      <Typography variant="h6" gutterBottom>
        Podsumowanie sprzedaży
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Przychód
                </Typography>
                <Typography variant="h4">
                  {formatPrice(summaryData?.totalRevenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Zamówienia
                </Typography>
                <Typography variant="h4">
                  {summaryData?.totalOrders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Średnia wartość zamówienia
                </Typography>
                <Typography variant="h4">
                  {formatPrice(summaryData?.averageOrderValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nowi klienci
                </Typography>
                <Typography variant="h4">
                  {summaryData?.newCustomers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Lista raportów */}
      <Typography variant="h6" gutterBottom>
        Dostępne raporty
      </Typography>
      
      <Grid container spacing={3}>
        {reportTypes.map(report => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card>
              <CardActionArea component={RouterLink} to={report.path}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {report.icon}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {report.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {report.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              
              <Divider />
              
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadReport(report.id);
                  }}
                  disabled={downloadingReport}
                >
                  Pobierz CSV
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsList;