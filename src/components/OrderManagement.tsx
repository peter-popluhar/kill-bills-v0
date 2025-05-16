import React from 'react';
import { Box, CircularProgress, Alert, Typography, Stack, Paper } from '@mui/material';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrencyConversion } from '../hooks/useCurrencyConversion';
import { useModalControls } from '../hooks/useModalControls';

// Import the new component modules
import { AddItemForm } from './OrderManagement/AddItemForm';
import { BillSummaryCard } from './OrderManagement/BillSummaryCard';
import { OrderItemList } from './OrderManagement/OrderItemList';
import { ModalComponents } from './OrderManagement/ModalComponents';

export const OrderManagement: React.FC = () => {
  const {
    orderItems,
    isLoading,
    error,
    summary,
    handlers,
  } = useOrderManagement();
  
  const { currency } = useCurrency();
  
  // Get total amount for currency conversion
  const totalAmount = String(summary?.totalsByCurrency?.[currency] || "0");
  
  // Use our custom currency conversion hook
  const {
    convertedAmount,
    isLoadingRate,
    conversionError,
    exchangeRateText,
    exchangeRate,
    targetCurrency
  } = useCurrencyConversion(totalAmount);
  
  // Use our modal controls hook
  const modals = useModalControls();
  
  // Handler for archiving orders with feedback
  const handleArchiveWithFeedback = async () => {
    if (orderItems.length === 0) return;
    
    try {
      // Call the archive function and await its completion
      await handlers.handleArchiveOrder();
      
      // Show success dialog
      modals.showArchiveSuccess();
    } catch (error) {
      console.error("Error archiving order:", error);
    }
  };
  
  // Handler for location change with modal state
  const handleLocationModalOk = () => {
    handlers.handleLocationChange(modals.locationInput);
    modals.handleCloseLocationModal();
  };
  
  // Handler for item name change with modal state
  const handleNameModalOk = () => {
    if (modals.currentEditingItem && modals.nameInput) {
      handlers.handleNameChange(modals.currentEditingItem, modals.nameInput);
      modals.handleCloseNameModal();
    }
  };
  
  // Handler for item price change with modal state
  const handlePriceModalOk = () => {
    if (modals.currentEditingItem && modals.priceInput) {
      const newPrice = Number(modals.priceInput);
      if (!isNaN(newPrice) && newPrice > 0) {
        handlers.handlePriceChange(modals.currentEditingItem, newPrice);
      }
      modals.handleClosePriceModal();
    }
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
      <Paper sx={{ p: 2 }}>
        <AddItemForm 
          onSubmit={handlers.handleSubmit} 
          itemsExist={orderItems.length > 0} 
        />
        {orderItems.length > 0 &&
          <BillSummaryCard 
            billLocation={summary.billLocation}
            totalAmount={totalAmount}
            currency={currency}
            itemCount={summary.itemCount}
            lastOrder={summary.lastOrder}
            convertedAmount={convertedAmount}
            isLoadingRate={isLoadingRate}
            conversionError={conversionError}
            targetCurrency={targetCurrency}
            exchangeRateText={exchangeRateText}
            onArchive={handleArchiveWithFeedback}
            onDelete={handlers.handleDeleteOrder}
            onLocationEdit={() => modals.handleOpenLocationModal(summary.billLocation || '')}
          />
        }
      </Paper>

      {orderItems.length > 0 && (
        <Stack spacing={3}>
          <OrderItemList 
            orderItems={orderItems}
            currency={currency}
            exchangeRate={exchangeRate ?? undefined}
            onIncrementAmount={handlers.handleIncrementAmount}
            onDecrementAmount={handlers.handleDecrementAmount}
            onEditName={modals.handleOpenNameModal}
            onEditPrice={modals.handleOpenPriceModal}
            onDeleteItem={handlers.handleDeleteItem}
          />
        </Stack>
      )}
      
      <ModalComponents
        nameModalOpen={modals.nameModalOpen}
        nameInput={modals.nameInput}
        priceModalOpen={modals.priceModalOpen}
        priceInput={modals.priceInput}
        locationModalOpen={modals.locationModalOpen}
        locationInput={modals.locationInput}
        archiveSuccessOpen={modals.archiveSuccessOpen}
        currency={currency}
        onNameInputChange={modals.handleNameInputChange}
        onPriceInputChange={modals.handlePriceInputChange}
        onLocationInputChange={modals.handleLocationInputChange}
        onNameModalClose={modals.handleCloseNameModal}
        onPriceModalClose={modals.handleClosePriceModal}
        onLocationModalClose={modals.handleCloseLocationModal}
        onNameModalSubmit={handleNameModalOk}
        onPriceModalSubmit={handlePriceModalOk}
        onLocationModalSubmit={handleLocationModalOk}
        onArchiveSuccessClose={() => modals.setArchiveSuccessOpen(false)}
      />
    </Stack>
  );
};
