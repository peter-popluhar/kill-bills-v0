import React, { useRef } from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { orderFormService } from '../services/orderFormService';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  ButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';

export const OrderManagement: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    orderItems,
    editingItem,
    editingLocation,
    isLoading,
    error,
    summary,
    handlers
  } = useOrderManagement();

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
        <Typography variant="body1">Error loading orders</Typography>
        <Typography variant="body2">{error.message}</Typography>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper component="form" ref={formRef} onSubmit={handlers.handleSubmit} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'calc(33.33% - 16px)' } }}>
            <TextField
              fullWidth
              name="itemName"
              label="Item Name"
              required
              size="small"
              variant='standard'
            />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'calc(25% - 16px)' } }}>
            <TextField
              fullWidth
              type="number"
              name="itemInitialPrice"
              label="Price"
              required
              size="small"
              variant='standard'
            />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'calc(25% - 16px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Currency</InputLabel>
              <Select
                name="currency"
                defaultValue="CZK"
                label="Currency"
                variant='standard'
              >
                <MenuItem value="CZK">CZK</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add Item
            </Button>
          </Box>
        </Box>
      </Paper>

      {orderItems.length > 0 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 'calc(66.66% - 24px)' } }}>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">Total Items:</Typography>
                      <Typography variant="body1">{summary.itemCount}</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">Bill Location:</Typography>
                      {editingLocation ? (
                        <form onSubmit={(e) => orderFormService.handleLocationSubmit(e, handlers.handleLocationChange)}>
                          <TextField
                            name="location"
                            size="small"
                            defaultValue={summary.billLocation}
                            autoFocus
                          />
                        </form>
                      ) : (
                        <Typography
                          variant="body1"
                          onClick={() => handlers.setEditingLocation(true)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {summary.billLocation || 'Click to set location'}
                        </Typography>
                      )}
                    </Box>
                    
                    {Object.entries(summary.totalsByCurrency).map(([currency, total]) => (
                      <Box key={currency} display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1">Total ({currency}):</Typography>
                        <Typography variant="body1">{Number(total).toFixed(2)}</Typography>
                      </Box>
                    ))}
                    
                    {summary.lastOrder && (
                      <>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1">Last Order:</Typography>
                          <Typography variant="body1">{summary.lastOrder.itemName}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1">Last Order Time:</Typography>
                          <Typography variant="body1">
                            {summary.lastOrder.currentDate} {summary.lastOrder.currentTime}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ 
                  flexGrow: 1, 
                  minWidth: { xs: '100%', md: 'calc(33.33% - 24px)' },
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start'
                }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handlers.handleDeleteOrder}
                    >
                      Delete Order
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ArchiveIcon />}
                      onClick={handlers.handleArchiveOrder}
                    >
                      Archive Order
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editingItem === `${item.id}-name` ? (
                        <form onSubmit={(e) => orderFormService.handleNameSubmit(e, item, handlers.handleNameChange)}>
                          <TextField
                            name="name"
                            size="small"
                            defaultValue={item.itemName}
                            autoFocus
                          />
                        </form>
                      ) : (
                        <Typography
                          onClick={() => handlers.setEditingItem(`${item.id}-name`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {item.itemName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingItem === `${item.id}-price` ? (
                        <form onSubmit={(e) => orderFormService.handlePriceSubmit(e, item, handlers.handlePriceChange)}>
                          <TextField
                            type="number"
                            name="price"
                            size="small"
                            defaultValue={item.itemInitialPrice}
                            autoFocus
                          />
                        </form>
                      ) : (
                        <Typography
                          onClick={() => handlers.setEditingItem(`${item.id}-price`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {item.itemInitialPrice} {item.currency}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <ButtonGroup size="small">
                        <IconButton onClick={() => handlers.handleDecrementAmount(item)} size="small">
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                          {item.itemCalculatedAmount}
                        </Typography>
                        <IconButton onClick={() => handlers.handleIncrementAmount(item)} size="small">
                          <AddIcon />
                        </IconButton>
                      </ButtonGroup>
                    </TableCell>
                    <TableCell>{item.itemCalculatedPrice} {item.currency}</TableCell>
                    <TableCell>{item.currentDate}</TableCell>
                    <TableCell>{item.currentTime}</TableCell>
                    <TableCell>
                      <ButtonGroup size="small">
                        <IconButton onClick={() => handlers.setEditingItem(`${item.id}-name`)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handlers.handleDeleteItem(item.id!)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </Stack>
  );
}; 
