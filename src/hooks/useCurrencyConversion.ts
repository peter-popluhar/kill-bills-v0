import { useState, useRef, useEffect, useCallback } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface UseCurrencyConversionReturn {
  convertedAmount: string | null;
  isLoadingRate: boolean;
  conversionError: string | null;
  exchangeRateText: string | null;
  exchangeRate: number | null;
  targetCurrency: string;
}

export function useCurrencyConversion(amount: string): UseCurrencyConversionReturn {
  const { currency } = useCurrency();
  
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

  // Get the target currency based on the current currency
  const getTargetCurrency = useCallback(() => {
    return currency === 'CZK' ? 'EUR' : 'CZK';
  }, [currency]);

  const targetCurrency = getTargetCurrency();

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
        rateCache.current.to === targetCurrency && 
        Date.now() - rateCache.current.timestamp < 10 * 60 * 1000) {
      return;
    }

    // Fetch current currency to target currency rate
    const fetchRate = async () => {
      try {
        const from = currency;
        const to = targetCurrency;
        
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
  }, [currency, targetCurrency]);

  // Effect to trigger conversion only when relevant data changes
  useEffect(() => {
    // Skip if using default currency (CZK)
    if (currency === 'CZK') {
      setConvertedAmount(null);
      setIsLoadingRate(false);
      // Don't attempt any API calls for currency conversion when using CZK
      return;
    }
    
    // Skip if amount is zero
    if (!amount || Number(amount) === 0) {
      setConvertedAmount(null);
      return;
    }

    // Skip if nothing relevant has changed
    if (
      amount === prevAmountRef.current && 
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
          const convertedValue = (Number(amount) * cachedRate).toFixed(2);
          setConvertedAmount(convertedValue);
          setIsLoadingRate(false);
          return;
        }
        
        const numAmount = Number(amount);
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
        
        const convertedValue = (numAmount * data.rates[to]).toFixed(2);
        setConvertedAmount(convertedValue);
      } catch (error) {
        // Catch any other potential errors without crashing
        console.error('Error in currency conversion:', error);
        setConversionError('Could not convert currency');
        setConvertedAmount(null);
      } finally {
        // Update refs after the operation completes
        prevAmountRef.current = amount;
        prevCurrencyRef.current = currency;
        setIsLoadingRate(false);
      }
    };

    // Add a small delay to prevent excessive API calls
    const timerId = setTimeout(() => {
      fetchRate();
    }, 300);
    
    return () => clearTimeout(timerId);
  }, [amount, currency, targetCurrency]);

  const exchangeRateText = getExchangeRateText();
  const exchangeRate = rateCache.current?.rate || null;

  return {
    convertedAmount,
    isLoadingRate,
    conversionError,
    exchangeRateText,
    exchangeRate,
    targetCurrency
  };
}
