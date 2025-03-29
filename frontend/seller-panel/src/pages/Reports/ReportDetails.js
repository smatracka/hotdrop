import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { useAuth } from '../../contexts/AuthContext';
import { getSalesOverTime, getTopProducts, getDropStats, getCustomerStats, downloadReport } from '../../services/reportService';
import { formatPrice, formatDate } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

// Mapowanie typów raportów na nazwy i funkcje pobierające dane
const reportTypeMap = {
  'sales': {
    title: 'Raport sprzedaży',
    fetchFunction: getSalesOverTime,
    icon: ChartIcon
  },
  'products': {
    title: 'Raport produktów',
    fetchFunction: getTopProducts,
    icon: ChartIcon
  },
  'drops': {
    title: 'Raport dropów',
    fetchFunction: getDropStats,
    icon: ChartIcon
  },
  'customers': {
    title: 'Raport klientów',
    fetchFunction: getCustomerStats,
    icon: ChartIcon
  }
};

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 dni wstecz
    endDate: new Date()
  });
  const [interval, setInterval] = useState('day');
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Pobierz dane raportu
  useEffect(() => {
    const fetchReportData = async () => {
      // Sprawdź, czy typ raportu jest obsługiwany
      if (!reportTypeMap[id]) {
        navigate('/reports');
        return;
      }
      
      try {
        setLoading(true);
        const fetchFunction = reportTypeMap[id].fetchFunction;
        
        const response = await fetchFunction(user.id, {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          interval
        });

        if (response.success) {
          setReportData(response.data);
        } else {
          console.error(`Error fetching ${id} report:`, response.message);
        }
      } catch (error) {
        console.error(`Error fetching ${id} report:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id, user.id, dateRange, interval, navigate]);

  // Zmiana aktywnej zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Obsługa pobrania raportu
  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const params = {
        sellerId: user.id,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        interval,
        format: 'csv'
      };

      const blobData = await downloadReport(id, params);
      
      // Tworzymy link do pobrania pliku
      const url = window.URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}_report_${formatDate(new Date(), 'short').replace(/\./g, '')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${id} report:`, error);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Komponent generujący wykres
  const renderChart = () => {
    if (!reportData) return null;
    
    // Tutaj należy dostosować logikę do konkretnego typu raportu
    // Dla uproszczenia będziemy zakładać, że dane mają format kompatybilny z wykresem liniowym
    
    let chartData = {
      labels: [],
      datasets: [
        {
          label: 'Wartość',
          data: [],
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }
      ]
    };
    
    // Dostosuj dane w zależności od typu raportu
    switch (id) {
      case 'sales':
        chartData.labels = reportData.dates.map(date => formatDate(date, 'short'));
        chartData.datasets[0].label = 'Przychód';
        chartData.datasets[0].data = reportData.revenues;
        break;
      case 'products':
        chartData.labels = reportData.map(product => product.name);
        chartData.datasets[0].label = 'Ilość sprzedanych';
        chartData.datasets[0].data = reportData.map(product => product.quantitySold);
        break;
      case 'customers':
        chartData.labels = reportData.dates.map(date => formatDate(date, 'short'));
        chartData.datasets[0].label = 'Nowi klienci';
        chartData.datasets[0].data = reportData.newCustomers;
        break;
      case 'drops':
        chartData.labels = reportData.map(drop => drop.name);
        chartData.datasets[0].label = 'Przychód';
        chartData.datasets[0].data = reportData.map(drop => drop.revenue);
        break;
      default:
        break;
    }
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: reportTypeMap[id].title
        }
      }
    };
    
    return (
      <Box sx={{ height: 400, p: 2 }}>
        <Chart type="line" data={chartData} options={options} />
      </Box>
    );
  };

  // Komponent generujący tabelę danych
  const renderDataTable = () => {
    if (!reportData) return null;
    
    // Tutaj należy dostosować logikę do konkretnego typu raportu
    // Dla uproszczenia zdefiniujemy strukturę danych dla każdego typu
    
    let columns = [];
    let data = [];
    
    switch (id) {
      case 'sales':
        columns = [
          { id: 'date', label: 'Data', format: (value) => formatDate(value, 'short') },
          { id: 'revenue', label: 'Przychód', format: (value) => formatPrice(value) },
          { id: 'orders', label: 'Zamówienia', format: (value) => value },
          { id: 'average', label: 'Średnia wartość', format: (value) => formatPrice(value) }
        ];
        
        data = reportData.dates.map((date, index) => ({
          id: index,
          date,
          revenue: reportData.revenues[index] || 0,
          orders: reportData.orders[index] || 0,
          average: reportData.averages[index] || 0
        }));
        break;
      case 'products':
        columns = [
          { id: 'name', label: 'Produkt' },
          { id: 'sku', label: 'SKU' },
          { id: 'quantitySold', label: 'Ilość sprzedana' },
          { id: 'revenue', label: 'Przychód', format: (value) => formatPrice(value) },
          { id: 'averagePrice', label: 'Średnia cena', format: (value) => formatPrice(value) }
        ];
        
        data = reportData.map((product, index) => ({
          id: index,
          ...product
        }));
        break;
      case 'drops':
        columns = [
          { id: 'name', label: 'Drop' },
          { id: 'startDate', label: 'Data', format: (value) => formatDate(value, 'short') },
          { id: 'totalOrders', label: 'Zamówienia' },
          { id: 'revenue', label: 'Przychód', format: (value) => formatPrice(value) },
          { id: 'conversion', label: 'Konwersja', format: (value) => `${value}%` }
        ];
        
        data = reportData.map((drop, index) => ({
          id: index,
          ...drop
        }));
        break;
      case 'customers':
        columns = [
          { id: 'date', label: 'Data', format: (value) => formatDate(value, 'short') },
          { id: 'newCustomers', label: 'Nowi klienci' },
          { id: 'activeCustomers', label: 'Aktywni klienci' },
          { id: 'averageSpent', label: 'Średnie wydatki', format: (value) => formatPrice(value) }
        ];
        
        data = reportData.dates.map((date, index) => ({
          id: index,
          date,
          newCustomers: reportData.newCustomers[index] || 0,
          activeCustomers: reportData.activeCustomers[index] || 0,
          averageSpent: reportData.averageSpent[index] || 0
        }));
        break;
      default:
        break;
    }
    
    return (
      <DataTable
        columns={columns}
        data={data}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    );
  };

  const breadcrumbs = [
    { label: 'Raporty', path: '/reports' },
    { label: reportTypeMap[id] ? reportTypeMap[id].title : 'Szczegóły raportu' }
  ];

  return (
    <Box>
      <PageHeader 
        title={reportTypeMap[id] ? reportTypeMap[id].title : 'Szczegóły raportu'} 
        breadcrumbs={breadcrumbs}
      />
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
        >
          Powrót do raportów
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
          disabled={downloadingReport || loading}
        >
          Pobierz CSV
        </Button>
      </Box>
      
      {/* Panel filtrów */}
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
              <InputLabel id="interval-label">Przedział</InputLabel>
              <Select
                labelId="interval-label"
                value={interval}
                label="Przedział"
                onChange={(e) => setInterval(e.target.value)}
              >
                <MenuItem value="day">Dzień</MenuItem>
                <MenuItem value="week">Tydzień</MenuItem>
                <MenuItem value="month">Miesiąc</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Zakładki */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Wykres" />
          <Tab label="Dane" />
        </Tabs>
      </Paper>
      
      {/* Zawartość */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {activeTab === 0 ? (
            renderChart()
          ) : (
            renderDataTable()
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ReportDetails;