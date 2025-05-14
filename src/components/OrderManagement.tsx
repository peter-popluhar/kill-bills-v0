import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  CurrencyExchange as CurrencyExchangeIcon,
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
  
  // State for converted currency amount
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  
  // Cache for exchange rates to avoid redundant API calls
  const rateCache = useRef<{
    from: string;
    to: string;
    rate: number;
    timestamp: number;
  } | null>(null);
  
  // Track the previous amount to avoid unnecessary recalculations
  const prevAmountRef = useRef<string | null>(null);
  const prevCurrencyRef = useRef<string | null>(null);

  // Memoized function to get the current amount for conversion
  const getCurrentAmount = useCallback(() => {
    return summary?.totalsByCurrency?.[currency] || "0";
  }, [summary?.totalsByCurrency, currency]);

  // Get the target currency based on the current currency
  const getTargetCurrency = useCallback(() => {
    return currency === 'CZK' ? 'EUR' : 'CZK';
  }, [currency]);

  // Function to get exchange rate display text
  const getExchangeRateText = useCallback(() => {
    if (!rateCache.current || currency === 'CZK') return null;
    
    const rate = rateCache.current.rate;
    const fromCurrency = rateCache.current.from;
    const toCurrency = rateCache.current.to;
    
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  }, [currency, rateCache]);

  // Effect to fetch EUR rate regardless of current currency
  useEffect(() => {
    // Skip all currency API calls when using CZK
    if (currency === 'CZK') {
      return;
    }

    // Skip if we already have a valid EUR rate
    if (rateCache.current && 
        rateCache.current.from === 'EUR' && 
        rateCache.current.to === 'CZK' && 
        Date.now() - rateCache.current.timestamp < 10 * 60 * 1000) {
      return;
    }

    // Fetch EUR to CZK rate when EUR is selected
    const fetchEurToCzkRate = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=CZK');
        
        if (!res.ok) {
          console.warn(`API returned status ${res.status}: ${res.statusText}`);
          return;
        }
        
        const data = await res.json();
        
        if (!data.rates || !data.rates.CZK) {
          console.warn('Missing rate data in API response:', data);
          return;
        }
        
        // Store in cache
        rateCache.current = {
          from: 'EUR',
          to: 'CZK',
          rate: data.rates.CZK,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Error fetching CZK rate:', error);
      }
    };

    fetchEurToCzkRate();
  }, [currency]);

  // Effect to fetch exchange rate for the appropriate direction based on current currency
  useEffect(() => {
    // Skip if we already have a valid rate for the current direction
    if (rateCache.current && 
        rateCache.current.from === currency && 
        rateCache.current.to === getTargetCurrency() && 
        Date.now() - rateCache.current.timestamp < 10 * 60 * 1000) {
      return;
    }

    // Fetch current currency to target currency rate
    const fetchRate = async () => {
      try {
        const from = currency;
        const to = getTargetCurrency();
        
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        
        if (!res.ok) {
          console.warn(`API returned status ${res.status}: ${res.statusText}`);
          return;
        }
        
        const data = await res.json();
        
        if (!data.rates || !data.rates[to]) {
          console.warn('Missing rate data in API response:', data);
          return;
        }
        
        // Store in cache
        rateCache.current = {
          from,
          to,
          rate: data.rates[to],
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Error fetching rate:', error);
      }
    };

    fetchRate();
  }, [currency, getTargetCurrency]);

  // Effect to trigger conversion only when relevant data changes
  useEffect(() => {
    // Skip if using default currency (CZK)
    if (currency === 'CZK') {
      setConvertedAmount(null);
      setIsLoadingRate(false);
      // Don't attempt any API calls for currency conversion when using CZK
      return;
    }
    
    const currentAmount = getCurrentAmount();
    const targetCurrency = getTargetCurrency();
    
    // Skip if amount is zero
    if (!currentAmount || Number(currentAmount) === 0) {
      setConvertedAmount(null);
      return;
    }

    // Skip if nothing relevant has changed
    if (
      currentAmount === prevAmountRef.current && 
      currency === prevCurrencyRef.current &&
      rateCache.current?.from === currency && 
      rateCache.current?.to === targetCurrency && 
      Date.now() - (rateCache.current?.timestamp || 0) < 10 * 60 * 1000
    ) {
      return;
    }

    const fetchRate = async () => {
      try {
        setIsLoadingRate(true);
        setConversionError(null);
        
        // If we have a valid cached rate, use it immediately
        if (
          rateCache.current && 
          rateCache.current.from === currency && 
          rateCache.current.to === targetCurrency && 
          Date.now() - rateCache.current.timestamp < 10 * 60 * 1000
        ) {
          const cachedRate = rateCache.current.rate;
          const convertedValue = (Number(currentAmount) * cachedRate).toFixed(2);
          setConvertedAmount(convertedValue);
          setIsLoadingRate(false);
          return;
        }
        
        const amount = Number(currentAmount);
        const from = currency;
        const to = targetCurrency;
        
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        
        // Handle API errors gracefully without throwing
        if (!res.ok) {
          console.warn(`API returned status ${res.status}: ${res.statusText}`);
          setConversionError(`Currency conversion unavailable (${res.status})`);
          setConvertedAmount(null);
          return;
        }
        
        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          setConversionError('Invalid response from currency service');
          setConvertedAmount(null);
          return;
        }
        
        if (!data.rates || !data.rates[to]) {
          console.warn('Missing rate data in API response:', data);
          setConversionError(`Rate for ${to} not available`);
          setConvertedAmount(null);
          return;
        }
        
        // Store in cache
        rateCache.current = {
          from,
          to,
          rate: data.rates[to],
          timestamp: Date.now()
        };
        
        const convertedValue = (amount * data.rates[to]).toFixed(2);
        setConvertedAmount(convertedValue);
      } catch (error) {
        // Catch any other potential errors without crashing
        console.error('Error in currency conversion:', error);
        setConversionError('Could not convert currency');
        setConvertedAmount(null);
      } finally {
        // Update refs after the operation completes
        prevAmountRef.current = currentAmount.toString();
        prevCurrencyRef.current = currency;
        setIsLoadingRate(false);
      }
    };

    // Add a small delay to prevent excessive API calls
    const timerId = setTimeout(() => {
      fetchRate();
    }, 300);
    
    return () => clearTimeout(timerId);
  }, [currency, getCurrentAmount, getTargetCurrency]);

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
              name="itemInitialPrice"
              label="Price"
              required
              size="small"
              variant='standard'
              inputMode="decimal"
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
                    
                    {/* Currency conversion display */}
                      {isLoadingRate ? (
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                            Converting to {getTargetCurrency()}...
                          </Typography>
                          <CircularProgress size={16} />
                        </Box>
                      ) : (
                        convertedAmount && (
                          <>
                          <Box display="flex" alignItems="center">
                            <CurrencyExchangeIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'primary.main' }} />
                            <Typography variant="body1" fontWeight="medium" sx={{ color: 'primary.main' }}>
                               {convertedAmount} {getTargetCurrency()}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'info.main', mt: 0.5 }}>
                              <CurrencyExchangeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                              {getExchangeRateText()}
                            </Typography>
                          </Box>
                          </>
                          
                        )
                      )}
                      {conversionError && (
                        <Typography variant="body2" sx={{ color: 'error.main' }}>
                          {conversionError}
                        </Typography>
                      )}
                    
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
                          {item.itemCalculatedAmount} x {item.itemInitialPrice} = {item.itemCalculatedPrice} {currency}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{item.currentTime}</Typography>

                        {currency === 'EUR' && rateCache.current && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', mt: 0.5 }}>
                            <CurrencyExchangeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                              {(Number(item.itemCalculatedPrice) * rateCache.current.rate).toFixed(2)} CZK
                          </Typography>
                        )}
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
