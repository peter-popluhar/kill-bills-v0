import React, { useRef, useState, useEffect } from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
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
  Button,
  Modal,
  Collapse,
  Dialog,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  DeleteForever,
  TouchApp,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TextFields as TextFieldsIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';

import { OrderItem } from '../types/OrderItem';

export const OrderManagement: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    orderItems,
    isLoading,
    error,
    summary,
    handlers,
    lastUpdateTimestamp
  } = useOrderManagement();
  const { currency } = useCurrency();

  // Modal state for location editing
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(summary.billLocation || '');
  
  // Modal state for item name editing
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [currentEditingItem, setCurrentEditingItem] = useState<OrderItem | null>(null);
  
  // Modal state for price editing
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  
  // State to track expanded/collapsed items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // State for archive success dialog
  const [archiveSuccessOpen, setArchiveSuccessOpen] = useState(false);

  useEffect(() => {
    // Trigger re-render when lastUpdateTimestamp changes
  }, [lastUpdateTimestamp]);

  const handleOpenLocationModal = () => {
    setLocationInput(summary.billLocation || '');
    setLocationModalOpen(true);
  };
  const handleCloseLocationModal = () => setLocationModalOpen(false);
  const handleLocationModalOk = () => {
    handlers.handleLocationChange(locationInput);
    setLocationModalOpen(false);
  };
  
  // Handlers for item name editing modal
  const handleOpenNameModal = (item: OrderItem) => {
    setNameInput(item.itemName);
    setCurrentEditingItem(item);
    setNameModalOpen(true);
  };
  const handleCloseNameModal = () => setNameModalOpen(false);
  const handleNameModalOk = () => {
    if (currentEditingItem && nameInput) {
      handlers.handleNameChange(currentEditingItem, nameInput);
      setNameModalOpen(false);
    }
  };
  
  // Handlers for price editing modal
  const handleOpenPriceModal = (item: OrderItem) => {
    setPriceInput(item.itemInitialPrice.toString());
    setCurrentEditingItem(item);
    setPriceModalOpen(true);
  };
  const handleClosePriceModal = () => setPriceModalOpen(false);
  const handlePriceModalOk = () => {
    if (currentEditingItem && priceInput) {
      const newPrice = Number(priceInput);
      if (!isNaN(newPrice) && newPrice > 0) {
        handlers.handlePriceChange(currentEditingItem, newPrice);
      }
      setPriceModalOpen(false);
    }
  };
  
  // Handler for archiving orders with feedback
  const handleArchiveWithFeedback = async () => {
    if (orderItems.length === 0) return;
    
    try {
      // Call the archive function and await its completion
      await handlers.handleArchiveOrder();
      
      // Show success dialog after archive is complete
      setArchiveSuccessOpen(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setArchiveSuccessOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Error archiving order:", error);
    }
  };
  
  // Toggle expanded state of an item
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
          <Box sx={{ flexGrow: 1, minWidth: { xs: 'calc(25% - 16px)' } }}>
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
          <Box >
            <IconButton
              type="submit"
              color="primary"
              size="large"
              aria-label="Add Item"
              sx={{backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Box>
          {orderItems.length < 1 && <Box sx={{ flexGrow: 1, minWidth: { xs: '100%'} }}> <Typography component="h3" color="inherit">Enter some item&#x24;</Typography></Box>}
        </Box>
      </Paper>

      {orderItems.length > 0 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack sx={{ textAlign: 'left' }}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Location:</strong></Typography>
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
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Total: </strong></Typography>
                      <Typography variant="body1" sx={{ textAlign: 'left' }}>{Number(summary.totalsByCurrency[currency] || 0).toFixed(2)} {currency}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Items:</strong></Typography>
                      <Typography variant="body1" sx={{ textAlign: 'left' }}>{summary.itemCount}</Typography>
                    </Box>
                    {summary.lastOrder && (
                      <Box display="flex" alignItems="flex-start">
                        <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Last order:</strong></Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left' }}>
                            {summary.lastOrder.itemName} at {summary.lastOrder.currentTime}
                          </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, ml: 2 }}>
                  <IconButton
                    onClick={handleArchiveWithFeedback}
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
            {[...orderItems].reverse().map((item) => (
              <Paper 
                key={item.id} 
                sx={{ 
                  p: 2, 
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => toggleExpand(item.id!)}
              >
                <Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1}}>
                        <Typography variant="subtitle1">
                          {item.itemName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.itemCalculatedAmount} x {item.itemInitialPrice} = {item.itemCalculatedPrice}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{item.currentTime}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Stack spacing={2}>
                      {expandedItems[item.id!] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                      </Stack>
                    </Box>
                  </Box>
                  
                  <Collapse in={expandedItems[item.id!]} timeout="auto">
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Stack sx={{ paddingTop: '1.5rem'}} direction={{ xs: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                          <IconButton onClick={() => handlers.handleIncrementAmount(item)} size="small" sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}>
                            <AddIcon fontSize='small'/>
                          </IconButton>
                          <IconButton onClick={() => handlers.handleDecrementAmount(item)} size="small" sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}>
                            <RemoveIcon fontSize='small'  />
                          </IconButton>
                          <IconButton onClick={() => handleOpenNameModal(item)} size="small" sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}>
                            <TextFieldsIcon fontSize='small' />
                          </IconButton>
                          <IconButton onClick={(e) => {e.stopPropagation(); handleOpenPriceModal(item);}} size="small" sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}>
                            <AttachMoneyIcon fontSize='small' />
                          </IconButton>
                          <IconButton 
                            onClick={() => handlers.handleDeleteItem(item.id!)}
                            size="small" sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </Box>
                  </Collapse>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
      
      {/* Modal for editing item name */}
      <Modal open={nameModalOpen} onClose={handleCloseNameModal}>
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
            label="Item Name"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            autoFocus
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            onClick={handleNameModalOk}
            sx={{ alignSelf: 'center' }}
          >
            OK
          </Button>
        </Box>
      </Modal>

      {/* Modal for editing price */}
      <Modal open={priceModalOpen} onClose={handleClosePriceModal}>
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
            label="Price"
            type="number"
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: <Typography variant="body2">{currency}</Typography>
            }}
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            onClick={handlePriceModalOk}
            sx={{ alignSelf: 'center' }}
          >
            OK
          </Button>
        </Box>
      </Modal>

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

      {/* Archive Success Dialog */}
      <Dialog
        open={archiveSuccessOpen}
        onClose={() => setArchiveSuccessOpen(false)}
        aria-labelledby="archive-success-dialog-title"
      >
        <DialogTitle id="alert-dialog-slide-title">
            <Typography component="p" variant="subtitle1">
                Bill was added to Archive
            </Typography>
        </DialogTitle>
      </Dialog>
    </Stack>
  );
};
