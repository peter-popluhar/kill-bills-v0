import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CurrencyExchange as CurrencyExchangeIcon } from '@mui/icons-material';

interface CurrencyConversionProps {
  isLoadingRate: boolean;
  convertedAmount: string | null;
  targetCurrency: string;
  conversionError: string | null;
  exchangeRateText: string | null;
}

export const CurrencyConversion: React.FC<CurrencyConversionProps> = ({
  isLoadingRate,
  convertedAmount,
  targetCurrency,
  conversionError,
  exchangeRateText
}) => {
  if (isLoadingRate) {
    return (
      <Box display="flex" alignItems="center">
        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
          Converting to {targetCurrency}...
        </Typography>
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (convertedAmount) {
    return (
      <>
        <Box display="flex" alignItems="center">
          <CurrencyExchangeIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'primary.main' }} />
          <Typography variant="body1" fontWeight="medium" sx={{ color: 'primary.main' }}>
            {convertedAmount} {targetCurrency}
          </Typography>
        </Box>
        {exchangeRateText && (
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'info.main', mt: 0.5 }}>
              <CurrencyExchangeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
              {exchangeRateText}
            </Typography>
          </Box>
        )}
      </>
    );
  }

  if (conversionError) {
    return (
      <Typography variant="body2" sx={{ color: 'error.main' }}>
        {conversionError}
      </Typography>
    );
  }

  return null;
};
