import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Launch as LaunchIcon,
  Event as EventIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { getDrops, deleteDrop, publishDrop, duplicateDrop } from '../../services/dropService';
import { formatDate } from '../../utils/helpers';

const DropsList = () => {
  const { user } = useAuth();
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropToDelete, setDropToDelete] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [currentDrop, setCurrentDrop] = useState(null);
  
  // Pobierz dropy
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        setLoading(true);
        const response = await getDrops({ sellerId: user.id });
        setDrops(response.data.docs || []);
      } catch (error) {
        console.error('Error fetching drops:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrops();
  }, [user.id]);
  
  // Filtrowanie dropów
  const filteredDrops = drops.filter(drop => {
    const matchesSearch = drop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Obsługa menu akcji dropu
  const handleActionMenuOpen = (event, drop) => {
    setActionMenuAnchor(event.currentTarget);
    setCurrentDrop(drop);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setCurrentDrop(null);
  };
  
  // Obsługa usuwania dropu
  const handleDeleteClick = (drop) => {
    setDropToDelete(drop);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteDrop(dropToDelete._id);
      setDrops(drops.filter(d => d._id !== dropToDelete._id));
      setDeleteDialogOpen(false);
      setDropToDelete(null);
    } catch (error) {
      console.error('Error deleting drop:', error);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDropToDelete(null);
  };
  
  // Obsługa publikowania dropu
  const handlePublishDrop = async (dropId) => {
    try {
      const response = await publishDrop(dropId);
      
      if (response.success) {
        // Aktualizuj status dropu
        setDrops(drops.map(drop => 
          drop._id === dropId 
            ? { ...drop, status: 'published' } 
            : drop
        ));
      }
    } catch (error) {
      console.error('Error publishing drop:', error);
    }
    
    handleActionMenuClose();
  };
  
  // Obsługa duplikowania dropu
  const handleDuplicateDrop = async (dropId) => {
    try {
      const response = await duplicateDrop(dropId);
      
      if (response.success) {
        // Dodaj nowy drop do listy
        setDrops([...drops, response.data]);
      }
    } catch (error) {
      console.error('Error duplicating drop:', error);
    }
    
    handleActionMenuClose();
  };
  
  const breadcrumbs = [
    { label: 'Dropy' }
  ];

  // Funkcja sprawdzająca, czy drop może być opublikowany
  const canPublish = (drop) => {
    return drop.status === 'draft' && 
           drop.products && 
           drop.products.length > 0 && 
           drop.startDate;
  };
  
  // Funkcja formatująca datę startu i zakończenia
  const formatDropDate = (drop) => {
    if (!drop.startDate) return 'Brak daty rozpoczęcia';
    
    if (drop.endDate) {
      return `${formatDate(drop.startDate, 'short')} - ${formatDate(drop.endDate, 'short')}`;
    }
    
    return formatDate(drop.startDate, 'short');
  };
  
  return (
    <Box>
      <PageHeader 
        title="Dropy" 
        breadcrumbs={breadcrumbs}
      />
      
      {/* Panel narzędzi */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Szukaj dropów..."
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
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Wszystkie statusy</MenuItem>
                <MenuItem value="draft">Szkice</MenuItem>
                <MenuItem value="published">Opublikowane</MenuItem>
                <MenuItem value="completed">Zakończone</MenuItem>
                <MenuItem value="cancelled">Anulowane</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/drops/new"
            >
              Nowy drop
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Lista dropów */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredDrops.length === 0 ? (
        <EmptyState
          title="Brak dropów"
          description={
            searchQuery || statusFilter !== 'all'
              ? "Nie znaleziono dropów pasujących do kryteriów wyszukiwania."
              : "Nie masz jeszcze żadnych dropów. Utwórz swój pierwszy drop, aby rozpocząć sprzedaż."
          }
          icon={AddIcon}
          actionLabel="Utwórz drop"
          onAction={() => window.location.href = '/drops/new'}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredDrops.map((drop) => (
            <Grid item xs={12} sm={6} md={4} key={drop._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      component={RouterLink} 
                      to={`/drops/${drop._id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {drop.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(event) => handleActionMenuOpen(event, drop)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <StatusBadge status={drop.status} sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {drop.description ? (
                      drop.description.length > 100
                        ? `${drop.description.substring(0, 100)}...`
                        : drop.description
                    ) : 'Brak opisu'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDropDate(drop)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Produkty: {drop.products ? drop.products.length : 0}
                  </Typography>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to={`/drops/${drop._id}`}
                  >
                    Edytuj
                  </Button>
                  
                  {drop.status === 'draft' ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={!canPublish(drop)}
                      onClick={() => handlePublishDrop(drop._id)}
                    >
                      Opublikuj
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      endIcon={<LaunchIcon />}
                      component="a"
                      href={`/preview/drops/${drop._id}`}
                      target="_blank"
                    >
                      Podgląd
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Menu akcji */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem 
          component={RouterLink} 
          to={`/drops/${currentDrop?._id}`}
          onClick={handleActionMenuClose}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edytuj
        </MenuItem>
        
        {currentDrop?.status === 'draft' && canPublish(currentDrop) && (
          <MenuItem onClick={() => currentDrop && handlePublishDrop(currentDrop._id)}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Opublikuj
          </MenuItem>
        )}
        
        <MenuItem onClick={() => currentDrop && handleDuplicateDrop(currentDrop._id)}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplikuj
        </MenuItem>
        
        <MenuItem onClick={() => currentDrop && handleDeleteClick(currentDrop)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Usuń</Typography>
        </MenuItem>
      </Menu>
      
      {/* Dialog potwierdzenia usunięcia */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć drop "${dropToDelete?.name}"? Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmColor="error"
      />
    </Box>
  );
};

export default DropsList;