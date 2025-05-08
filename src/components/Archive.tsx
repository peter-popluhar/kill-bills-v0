import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useArchive } from '../hooks/useArchive';
import { ArchivedOrder } from '../types/ArchivedOrder';

export const Archive: React.FC = () => {
  const { archivedOrders, isLoading, error } = useArchive();

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
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archivedOrders.map((order: ArchivedOrder) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="body2">
                    {order.date}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    {order.items?.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.itemName} ({item.itemCalculatedAmount}x {item.itemInitialPrice} {item.currency})
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {order.totalsByCurrency && Object.entries(order.totalsByCurrency).map(([currency, total]) => (
                    <Typography key={currency} variant="body2">
                      {Number(total).toFixed(2)} {currency}
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}; 
