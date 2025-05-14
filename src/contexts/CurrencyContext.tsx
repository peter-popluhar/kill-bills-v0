import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { useAuth } from './AuthContext';

export type Currency = 'CZK' | 'EUR';

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('CZK');
  const { user, isAuthorized } = useAuth();

  // Listen for currency changes in Firebase
  useEffect(() => {
    if (!user || !isAuthorized) return;

    // Check if there are any order items that would have a currency set
    const orderItemsRef = ref(database, 'orderItems');
    
    const unsubscribe = onValue(orderItemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = snapshot.val();
        // Try to find an item with a currency set
        const itemsArray = Object.values(items);
        if (itemsArray.length > 0) {
          // Get the first item's currency (they should all have the same currency)
          const firstItem = itemsArray[0] as any;
          if (firstItem.currency && (firstItem.currency === 'EUR' || firstItem.currency === 'CZK')) {
            setCurrencyState(firstItem.currency);
          }
        }
      }
    }, { onlyOnce: false });

    return () => unsubscribe();
  }, [user, isAuthorized]);

  // Function to update currency in all existing items
  const setCurrency = (newCurrency: Currency) => {
    if (!user || !isAuthorized) {
      setCurrencyState(newCurrency);
      return;
    }

    // Update state immediately for responsive UI
    setCurrencyState(newCurrency);

    // Update all existing items with the new currency
    const orderItemsRef = ref(database, 'orderItems');
    onValue(orderItemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = snapshot.val();
        const updates: Record<string, any> = {};
        
        // Create updates for each item's currency
        Object.keys(items).forEach(itemId => {
          updates[`orderItems/${itemId}/currency`] = newCurrency;
        });

        // Apply updates to Firebase
        if (Object.keys(updates).length > 0) {
          update(ref(database, '/'), updates).catch(error => {
            console.error('Error updating currency:', error);
          });
        }
      }
    }, { onlyOnce: true });
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
