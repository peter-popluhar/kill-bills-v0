import React, { useRef, useState } from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { orderFormService } from '../services/orderFormService';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  ButtonGroup,
  Button,
  Modal,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  DeleteForever,
  TouchApp,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';

export const OrderManagement: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    orderItems,
    editingItem,
    isLoading,
    error,
    summary,
    handlers
  } = useOrderManagement();
  const { currency } = useCurrency();

  // Modal state for location editing
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(summary.billLocation || '');

  const handleOpenLocationModal = () => {
    setLocationInput(summary.billLocation || '');
    setLocationModalOpen(true);
  };
  const handleCloseLocationModal = () => setLocationModalOpen(false);
  const handleLocationModalOk = () => {
    handlers.handleLocationChange(locationInput);
    setLocationModalOpen(false);
  };

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
      <Paper component="form" ref={formRef} onSubmit={e => {
        handlers.handleSubmit(e);
      }} sx={{ p: 2 }}>
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
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
            <IconButton
              type="submit"
              color="primary"
              size="large"
              aria-label="Add Item"
              sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {orderItems.length > 0 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}>Location:</Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'left', mr: 1 }}
                      >
                        {summary.billLocation || 'Click to set location'}
                      </Typography>
                      <IconButton size="small" onClick={handleOpenLocationModal}>
                        <TouchApp />
                      </IconButton>
                    </Box>
                    <Modal open={locationModalOpen} onClose={handleCloseLocationModal}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'background.paper',
                          boxShadow: 24,
                          p: 4,
                          borderRadius: 2,
                          minWidth: 300,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          label="Location"
                          value={locationInput}
                          onChange={e => setLocationInput(e.target.value)}
                          autoFocus
                          sx={{ mb: 2, width: '100%' }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleLocationModalOk}
                          sx={{ alignSelf: 'center' }}
                        >
                          OK
                        </Button>
                      </Box>
                    </Modal>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}>Total:</Typography>
                      <Typography variant="body1" sx={{ textAlign: 'left' }}>{Number(summary.totalsByCurrency[currency] || 0).toFixed(2)} {currency}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}>Items:</Typography>
                      <Typography variant="body1" sx={{ textAlign: 'left' }}>{summary.itemCount}</Typography>
                    </Box>
                    {summary.lastOrder && (
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}>Last order:</Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left' }}>
                          {summary.lastOrder.itemName} {summary.lastOrder.currentTime}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, ml: 2 }}>
                  <IconButton
                    onClick={handlers.handleArchiveOrder}
                    sx={{ backgroundColor: 'primary.main', color: 'white', mb: 1, '&:hover': { backgroundColor: 'primary.dark' } }}
                  >
                    <ArchiveIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={handlers.handleDeleteOrder}
                    sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
                  >
                    <DeleteForever fontSize="inherit" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            {orderItems.map((item) => (
              <Paper key={item.id} sx={{ p: 2, mb: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
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
                        <span onClick={() => handlers.setEditingItem(`${item.id}-name`)} style={{ cursor: 'pointer' }}>
                          {item.itemName}
                        </span>
                      )}
                    </Typography>
                    {editingItem === `${item.id}-price` ? (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <form onSubmit={(e) => orderFormService.handlePriceSubmit(e, item, handlers.handlePriceChange)}>
                          <TextField
                            type="number"
                            name="price"
                            size="small"
                            defaultValue={item.itemInitialPrice}
                            autoFocus
                          />
                        </form>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <span onClick={() => handlers.setEditingItem(`${item.id}-price`)} style={{ cursor: 'pointer' }}>
                          {item.itemInitialPrice} {currency}
                        </span>
                      </Typography>
                    )}
                    <Typography variant="body2">
                      Amount: {item.itemCalculatedAmount}
                    </Typography>
                    <Typography variant="body2">
                      Total: {item.itemCalculatedPrice} {currency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.currentDate} {item.currentTime}
                    </Typography>
                  </Box>
                  <Box>
                    <ButtonGroup size="small">
                      <IconButton onClick={() => handlers.handleDecrementAmount(item)} size="small">
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                        {item.itemCalculatedAmount}
                      </Typography>
                      <IconButton onClick={() => handlers.handleIncrementAmount(item)} size="small">
                        <RemoveIcon />
                      </IconButton>
                    </ButtonGroup>
                  </Box>
                  <Box>
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
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}; 
