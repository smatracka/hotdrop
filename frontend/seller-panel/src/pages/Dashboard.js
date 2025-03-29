import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatPrice, formatDate } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { getSalesSummary, getSalesOverTime } from '../services/reportService';
import { getDrops } from '../services/dropService';
import { getOrders } from '../services/orderService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    salesSummary: null,
    salesOverTime: null,
    recentDrops: [],
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Ustawienie domyślnych parametrów
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        // Równoległe pobieranie danych
        const [salesSummaryResponse, salesOverTimeResponse, recentDropsResponse, recentOrdersResponse] = await Promise.all([
          getSalesSummary(user.id, { startDate, endDate }),
          getSalesOverTime(user.id, { startDate, endDate, interval: 'day' }),
          getDrops({ sellerId: user.id, limit: 5, sort: 'startDate', order: 'desc' }),
          getOrders({ sellerId: user.id, limit: 5, sort: 'createdAt', order: 'desc' })
        ]);
        
        setDashboardData({
          salesSummary: salesSummaryResponse.data,
          salesOverTime: salesOverTimeResponse.data,
          recentDrops: recentDropsResponse.data.docs || [],
          recentOrders: recentOrdersResponse.data.docs || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user.id]);

  // Komponenty dla poszczególnych sekcji dashboardu

  // Karty podsumowujące
  const SummaryCards = () => {
    if (!dashboardData.salesSummary) return null;
    
    const { totalRevenue, totalOrders, averageOrderValue, totalCustomers } = dashboardData.salesSummary;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Przychód
              </Typography>
              <Typography variant="h4" component="div">
                {formatPrice(totalRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {dashboardData.salesSummary.revenueChange >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={dashboardData.salesSummary.revenueChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(dashboardData.salesSummary.revenueChange)}% w porównaniu z poprzednim okresem
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Zamówienia
              </Typography>
              <Typography variant="h4" component="div">
                {totalOrders}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {dashboardData.salesSummary.ordersChange >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={dashboardData.salesSummary.ordersChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(dashboardData.salesSummary.ordersChange)}% w porównaniu z poprzednim okresem
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Średnia wartość zamówienia
              </Typography>
              <Typography variant="h4" component="div">
                {formatPrice(averageOrderValue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {dashboardData.salesSummary.aovChange >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={dashboardData.salesSummary.aovChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(dashboardData.salesSummary.aovChange)}% w porównaniu z poprzednim okresem
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Klienci
              </Typography>
              <Typography variant="h4" component="div">
                {totalCustomers}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {dashboardData.salesSummary.customersChange >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={dashboardData.salesSummary.customersChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(dashboardData.salesSummary.customersChange)}% w porównaniu z poprzednim okresem
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Wykres sprzedaży
  const SalesChart = () => {
    if (!dashboardData.salesOverTime) return null;
    
    const { dates, revenues } = dashboardData.salesOverTime;
    
    const chartData = {
      labels: dates.map(date => formatDate(date, 'short')),
      datasets: [
        {
          label: 'Przychód',
          data: revenues,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }
      ]
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `Przychód: ${formatPrice(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatPrice(value)
          }
        }
      }
    };
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Przychód w czasie
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ height: 300 }}>
          <Chart type="line" data={chartData} options={options} />
        </Box>
      </Paper>
    );
  };

  // Najnowsze dropy
  const RecentDrops = () => {
    if (!dashboardData.recentDrops.length) {
      return (
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Ostatnie dropy
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Nie masz jeszcze żadnych dropów
            </Typography>
            <Button 
              component={Link} 
              to="/drops/new" 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Utwórz pierwszy drop
            </Button>
          </Box>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            Ostatnie dropy
          </Typography>
          <Button 
            component={Link} 
            to="/drops"
            color="primary"
            size="small"
          >
            Zobacz wszystkie
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {dashboardData.recentDrops.map((drop) => (
            <ListItem 
              key={drop._id}
              sx={{ 
                px: 1, 
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
              component={Link}
              to={`/drops/${drop._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <EventIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={drop.name}
                secondary={`${formatDate(drop.startDate, 'short')}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <StatusBadge status={drop.status} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  // Najnowsze zamówienia
  const RecentOrders = () => {
    if (!dashboardData.recentOrders.length) {
      return (
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Ostatnie zamówienia
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Nie masz jeszcze żadnych zamówień
            </Typography>
          </Box>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            Ostatnie zamówienia
          </Typography>
          <Button 
            component={Link} 
            to="/orders"
            color="primary"
            size="small"
          >
            Zobacz wszystkie
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {dashboardData.recentOrders.map((order) => (
            <ListItem 
              key={order._id}
              sx={{ 
                px: 1, 
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
              component={Link}
              to={`/orders/${order._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={`${order.orderNumber}`}
                secondary={`${formatDate(order.createdAt, 'short')} • ${order.customer.name}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="subtitle2">
                  {formatPrice(order.totalAmount)}
                </Typography>
                <StatusBadge status={order.status} />
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <PageHeader title="Dashboard" />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SummaryCards />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <SalesChart />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12}>
                <RecentDrops />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <RecentOrders />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;