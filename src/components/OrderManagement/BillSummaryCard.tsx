import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  DeleteForever,
  TouchApp,
} from '@mui/icons-material';
import { CurrencyConversion } from './CurrencyConversion';
import { OrderItem } from '../../types/OrderItem';

interface BillSummaryCardProps {
  billLocation: string;
  totalAmount: string;
  currency: string;
  itemCount: number;
  lastOrder: OrderItem | null;
  convertedAmount: string | null;
  isLoadingRate: boolean;
  conversionError: string | null;
  targetCurrency: string;
  exchangeRateText: string | null;
  onArchive: () => void;
  onDelete: () => void;
  onLocationEdit: () => void;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({
  billLocation,
  totalAmount,
  currency,
  itemCount,
  lastOrder,
  convertedAmount,
  isLoadingRate,
  conversionError,
  targetCurrency,
  exchangeRateText,
  onArchive,
  onDelete,
  onLocationEdit
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: '25px' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Location:</strong></Typography>
                <Typography
                    variant="body1"
                    sx={{ textAlign: 'left', mr: 1 }}
                >
                    {billLocation || 'Click to set location'}
                </Typography>
                <IconButton size="small" onClick={onLocationEdit}>
                    <TouchApp />
                </IconButton>
            </Box>
            <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Total: </strong></Typography>
                <Typography variant="body1" sx={{ textAlign: 'left' }}>{Number(totalAmount || 0).toFixed(2)} {currency}</Typography>
            </Box>
            
            <CurrencyConversion 
                isLoadingRate={isLoadingRate}
                convertedAmount={convertedAmount}
                targetCurrency={targetCurrency}
                conversionError={conversionError}
                exchangeRateText={exchangeRateText}
            />
            
            <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Items:</strong></Typography>
                <Typography variant="body1" sx={{ textAlign: 'left' }}>{itemCount}</Typography>
            </Box>
            {lastOrder && (
                <Box display="flex" alignItems="flex-start">
                    <Typography variant="subtitle1" sx={{ textAlign: 'left', mr: 1 }}><strong>Last order:</strong></Typography>
                    <Typography variant="body1" sx={{ textAlign: 'left' }}>
                        {lastOrder.itemName} at {lastOrder.currentTime}
                    </Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0, ml: 2 }}>
            <IconButton
                onClick={onArchive}
                sx={{ backgroundColor: 'primary.main', color: 'white', mb: 1, '&:hover': { backgroundColor: 'primary.dark' } }}
            >
                <ArchiveIcon fontSize="inherit" />
            </IconButton>
            <IconButton
                color="error"
                onClick={onDelete}
                sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
            >
                <DeleteForever fontSize="inherit" />
            </IconButton>
        </Box>
    </Box>
  );
};
