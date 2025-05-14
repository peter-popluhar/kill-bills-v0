import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DeleteForever as DeleteIcon } from '@mui/icons-material';
import { useArchiveManagement } from '../hooks/useArchiveManagement';
import { ArchivedOrder } from '../types/ArchivedOrder';

export const Archive: React.FC = () => {
  const { archivedOrders, isLoading, error, handleDeleteArchive } = useArchiveManagement();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="body1">Error loading archived orders</Typography>
        <Typography variant="body2">{error.message}</Typography>
      </Alert>
    );
  }

  if (!archivedOrders || archivedOrders.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          No archived orders found
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {archivedOrders.map((order: ArchivedOrder) => (
        <Paper key={order.archiveId || order.id} sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {order.date}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {order.location}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <strong>Items</strong>
              </Typography>
              <Stack spacing={0.5}>
                {order.items?.map((item, index) => (
                  <Typography key={item.itemName + '-' + index} variant="body2">
                    {item.itemName} ({item.itemCalculatedAmount}x {item.itemInitialPrice} {item.currency})
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                <strong>Total</strong>
              </Typography>
              <Stack spacing={0.5}>
                {order.totalsByCurrency && Object.entries(order.totalsByCurrency).map(([currency, total]) => (
                  <Typography key={currency} variant="body2">
                    {Number(total).toFixed(2)} {currency}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ))}
      <Box display="flex" justifyContent="center">
        <Tooltip title="Delete all archives">
          <IconButton
            onClick={handleDeleteArchive}
            color="error"
            size="large"
            sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
          >
            <DeleteIcon fontSize='large' />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );
}; 
