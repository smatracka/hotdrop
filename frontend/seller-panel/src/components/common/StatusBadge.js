import React from 'react';
import { Chip } from '@mui/material';

const statusMap = {
  // Statusy dla dropów
  draft: { label: 'Szkic', color: 'default' },
  published: { label: 'Opublikowany', color: 'success' },
  active: { label: 'Aktywny', color: 'success' },
  completed: { label: 'Zakończony', color: 'info' },
  cancelled: { label: 'Anulowany', color: 'error' },
  
  // Statusy dla zamówień
  pending: { label: 'Oczekujące', color: 'warning' },
  paid: { label: 'Opłacone', color: 'success' },
  shipped: { label: 'Wysłane', color: 'info' },
  delivered: { label: 'Dostarczone', color: 'success' },
  
  // Statusy dla płatności
  failed: { label: 'Nieudana', color: 'error' },
  refunded: { label: 'Zwrócona', color: 'warning' },
  
  // Statusy dla produktów
  out_of_stock: { label: 'Brak w magazynie', color: 'error' },
  low_stock: { label: 'Niski stan', color: 'warning' },
  hidden: { label: 'Ukryty', color: 'default' },
};

const StatusBadge = ({ status, customLabel }) => {
  const statusInfo = statusMap[status] || { label: status, color: 'default' };
  
  return (
    <Chip
      label={customLabel || statusInfo.label}
      color={statusInfo.color}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

export default StatusBadge;