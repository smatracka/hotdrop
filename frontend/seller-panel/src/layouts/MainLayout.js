// frontend/seller-panel/src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingBag as DropIcon,
  Inventory as ProductIcon,
  Receipt as OrderIcon,
  People as CustomerIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Szerokość drawera
const drawerWidth = 240;

// Elementy menu głównego
const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Dropy', icon: <DropIcon />, path: '/drops' },
  { text: 'Produkty', icon: <ProductIcon />, path: '/products' },
  { text: 'Zamówienia', icon: <OrderIcon />, path: '/orders' },
  { text: 'Klienci', icon: <CustomerIcon />, path: '/customers' },
  { text: 'Raporty', icon: <ReportIcon />, path: '/reports' },
  { text: 'Ustawienia', icon: <SettingsIcon />, path: '/settings' },
];

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Stan dla otwartego/zamkniętego drawera
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Stan dla menu użytkownika
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);
  
  // Stan dla menu powiadomień
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const isNotificationsOpen = Boolean(notificationsAnchor);
  
  // Stan dla menu języków
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const isLanguageOpen = Boolean(languageAnchor);

  // Obsługa otwierania/zamykania drawera
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Obsługa otwierania menu użytkownika
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Obsługa zamykania menu użytkownika
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Obsługa otwierania menu powiadomień
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  // Obsługa zamykania menu powiadomień
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Obsługa otwierania menu języków
  const handleLanguageOpen = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  // Obsługa zamykania menu języków
  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  // Obsługa wylogowania
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  // Obsługa nawigacji do nowego dropu
  const handleNewDrop = () => {
    navigate('/drops/new');
  };

  // Sprawdź, czy dana ścieżka jest aktywna
  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Drop Commerce
          </Typography>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleNewDrop}
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            Nowy Drop
          </Button>
          
          {/* Menu języków */}
          <Tooltip title="Zmień język">
            <IconButton
              color="inherit"
              aria-label="język"
              onClick={handleLanguageOpen}
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={languageAnchor}
            open={isLanguageOpen}
            onClose={handleLanguageClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLanguageClose}>Polski</MenuItem>
            <MenuItem onClick={handleLanguageClose}>English</MenuItem>
          </Menu>
          
          {/* Menu powiadomień */}
          <Tooltip title="Powiadomienia">
            <IconButton
              color="inherit"
              aria-label="powiadomienia"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationsAnchor}
            open={isNotificationsOpen}
            onClose={handleNotificationsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { width: 320, maxHeight: 500 }
            }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2">Nowe zamówienie</Typography>
                <Typography variant="body2" color="text.secondary">
                  Zamówienie #32456 zostało złożone
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 minuty temu
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2">Drop rozpoczęty</Typography>
                <Typography variant="body2" color="text.secondary">
                  Drop "Letnia Kolekcja 2025" został uruchomiony
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 godzinę temu
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2" color="primary" align="center">
                Zobacz wszystkie powiadomienia
              </Typography>
            </MenuItem>
          </Menu>
          
          {/* Menu użytkownika */}
          <Tooltip title="Ustawienia konta">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen ? 'true' : undefined}
            >
              <Avatar
                alt={user?.name}
                src={user?.avatarUrl}
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Wyloguj
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isMobile ? drawerOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', height: '100%', pt: 2 }}>
          <List>
            {mainMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isPathActive(item.path)}
                  sx={{
                    borderLeft: isPathActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                    background: isPathActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isPathActive(item.path) ? theme.palette.primary.main : 'inherit' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isPathActive(item.path) ? 'bold' : 'normal' 
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Footer */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            marginTop: 'auto'
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Drop Commerce
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Wersja 1.0.0
          </Typography>
        </Box>
      </Drawer>
      
      {/* Główna zawartość */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          pt: 8,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
