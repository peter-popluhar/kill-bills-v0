import { useState, useRef } from 'react';
import { database } from '../firebase';
import { ref, push, set, update } from 'firebase/database';
import { OrderItem } from '../types/OrderItem';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseCollection } from './useFirebaseCollection';
import { useLoadingError } from './useLoadingError';
import { useCurrency } from '../contexts/CurrencyContext';

interface OrderSummary {
  totalsByCurrency: { [key: string]: number };
  itemCount: number;
  lastOrder: OrderItem | null;
  billLocation: string;
}

export interface UseOrderManagementReturn {
  orderItems: OrderItem[];
  editingItem: string | null;
  editingLocation: boolean;
  isLoading: boolean;
  error: Error | null;
  summary: OrderSummary;
  lastUpdateTimestamp: number;
  handlers: {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleUpdateItem: (itemId: string, updates: Partial<OrderItem>) => void;
    handleIncrementAmount: (item: OrderItem) => void;
    handleDecrementAmount: (item: OrderItem) => void;
    handleNameChange: (item: OrderItem, newName: string) => void;
    handlePriceChange: (item: OrderItem, newPrice: number) => void;
    handleLocationChange: (newLocation: string) => void;
    handleDeleteItem: (itemId: string) => void;
    handleDeleteOrder: () => void;
    handleArchiveOrder: () => void;
    setEditingItem: (id: string | null) => void;
    setEditingLocation: (isEditing: boolean) => void;
    resetForm: () => void;
  };
}

export function useOrderManagement(): UseOrderManagementReturn {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now());
  const [manualLastOrder, setManualLastOrder] = useState<OrderItem | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { user, isAuthorized } = useAuth();
  const { setError } = useLoadingError();
  const { currency } = useCurrency();

  const {
    data: orderItems,
    isLoading,
    error,
    actions: { update: updateItem, remove: removeItem, removeAll }
  } = useFirebaseCollection<OrderItem>({
    collectionPath: 'orderItems'
  });

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
      const currencySelect = formRef.current.querySelector('select[name="currency"]') as HTMLSelectElement;
      if (currencySelect) {
        currencySelect.value = 'CZK';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAuthorized) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const itemName = formData.get('itemName') as string;
    const itemInitialPrice = Number(formData.get('itemInitialPrice'));

    if (!itemName || !itemInitialPrice) return;

    const itemsRef = ref(database, 'orderItems');
    const newItemRef = push(itemsRef);
    
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();

    const currentBillLocation = orderItems.length > 0 ? orderItems[0].billLocation : '';

    const newItem: OrderItem = {
      id: newItemRef.key || '',
      itemName,
      itemInitialPrice,
      itemInitialAmount: 1,
      itemCalculatedAmount: 1,
      itemCalculatedPrice: itemInitialPrice,
      currentDate,
      currentTime,
      user: user.email || 'unknown',
      billLocation: currentBillLocation,
      archiveId: '',
      currency: currency
    };

    set(newItemRef, {
      itemName,
      itemInitialPrice,
      itemCalculatedAmount: 1,
      itemCalculatedPrice: itemInitialPrice,
      currentDate,
      currentTime,
      user: user.email,
      billLocation: currentBillLocation,
    }).then(() => {
      form.reset();
      // Update manual last order immediately
      setManualLastOrder(newItem);
      setLastUpdateTimestamp(Date.now());
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error adding new item'));
    });
  };

  const handleIncrementAmount = (item: OrderItem) => {
    const newAmount = (item.itemCalculatedAmount || 0) + 1;
    
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();
    
    // Create updated item for immediate UI update
    const updatedItem = {
      ...item,
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount,
      currentDate,
      currentTime
    };
    
    updateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount,
      currentDate,
      currentTime
    }).then(() => {
      // Update manual last order immediately
      setManualLastOrder(updatedItem);
      setLastUpdateTimestamp(Date.now());
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error updating item'));
    });
  };

  const handleDecrementAmount = (item: OrderItem) => {
    if (item.itemCalculatedAmount <= 1) return;
    const newAmount = item.itemCalculatedAmount - 1;
    
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();
    
    // Create updated item for immediate UI update
    const updatedItem = {
      ...item,
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount,
      currentDate,
      currentTime
    };
    
    updateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount,
      currentDate,
      currentTime
    }).then(() => {
      // Update manual last order immediately
      setManualLastOrder(updatedItem);
      setLastUpdateTimestamp(Date.now());
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error updating item'));
    });
  };

  const handleNameChange = (item: OrderItem, newName: string) => {
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();
    
    // Create updated item for immediate UI update
    const updatedItem = {
      ...item,
      itemName: newName,
      currentDate,
      currentTime
    };
    
    updateItem(item.id!, { 
      itemName: newName,
      currentDate,
      currentTime
    }).then(() => {
      // Update manual last order immediately
      setManualLastOrder(updatedItem);
      setLastUpdateTimestamp(Date.now());
      setEditingItem(null);
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error updating item name'));
    });
  };

  const handlePriceChange = (item: OrderItem, newPrice: number) => {
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();
    
    // Create updated item for immediate UI update
    const updatedItem = {
      ...item,
      itemInitialPrice: newPrice,
      itemCalculatedPrice: newPrice * (item.itemCalculatedAmount || 1),
      currentDate,
      currentTime
    };
    
    updateItem(item.id!, {
      itemInitialPrice: newPrice,
      itemCalculatedPrice: newPrice * (item.itemCalculatedAmount || 1),
      currentDate,
      currentTime
    }).then(() => {
      // Update manual last order immediately
      setManualLastOrder(updatedItem);
      setLastUpdateTimestamp(Date.now());
      setEditingItem(null);
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error updating item price'));
    });
  };

  const handleLocationChange = (newLocation: string) => {
    if (!user || !isAuthorized) return;

    const updates = orderItems.reduce((acc, item) => ({
      ...acc,
      [`orderItems/${item.id}/billLocation`]: newLocation
    }), {});

    const itemsRef = ref(database, '/');
    update(itemsRef, updates).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error updating location'));
    });
    setEditingLocation(false);
  };

  const handleArchiveOrder = async () => {
    if (!user || !isAuthorized || !orderItems.length) return;

    const archiveRef = ref(database, 'archive');
    const newArchiveRef = push(archiveRef);

    const archivedOrder = {
      archiveId: newArchiveRef.key,
      date: orderItems[0].currentDate,
      time: orderItems[0].currentTime,
      location: orderItems[0].billLocation,
      items: orderItems.map(item => ({
        itemName: item.itemName,
        itemInitialPrice: item.itemInitialPrice,
        itemCalculatedAmount: item.itemCalculatedAmount,
        itemCalculatedPrice: item.itemCalculatedPrice,
        currency
      })),
      user: user.email,
      totalsByCurrency: orderItems.reduce((acc, item) => {
        acc[currency] = (acc[currency] || 0) + item.itemCalculatedPrice;
        return acc;
      }, {} as { [key: string]: number })
    };

    try {
      await set(newArchiveRef, archivedOrder);
      await removeAll();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error archiving order'));
    }
  };

  const calculateSummary = (): OrderSummary => {
    if (!orderItems.length) {
      return {
        totalsByCurrency: {},
        itemCount: 0,
        lastOrder: null,
        billLocation: ''
      };
    }

    // Sum up all item quantities instead of counting records
    const itemCount = orderItems.reduce((total, item) => total + (item.itemCalculatedAmount || 0), 0);
    
    // If we have a manual last order, use it for immediate UI feedback
    // Otherwise fall back to calculating from orderItems
    let lastOrder: OrderItem | null;
    if (manualLastOrder) {
      lastOrder = manualLastOrder;
    } else {
      lastOrder = orderItems.reduce((latest, current) => {
        const latestDate = new Date(`${latest.currentDate} ${latest.currentTime}`);
        const currentDate = new Date(`${current.currentDate} ${current.currentTime}`);
        return currentDate > latestDate ? current : latest;
      }, orderItems[0]);
    }

    const totalsByCurrency = {
      [currency]: orderItems.reduce((acc, item) => acc + item.itemCalculatedPrice, 0)
    };

    return {
      totalsByCurrency,
      itemCount,
      lastOrder,
      billLocation: orderItems[0]?.billLocation || ''
    };
  };

  return {
    orderItems,
    editingItem,
    editingLocation,
    isLoading,
    error,
    // Include lastUpdateTimestamp in dependency chain to trigger recalculation
    summary: calculateSummary(), 
    lastUpdateTimestamp, // Expose this so component can use it for dependency
    handlers: {
      handleSubmit,
      handleUpdateItem: updateItem,
      handleIncrementAmount,
      handleDecrementAmount,
      handleNameChange,
      handlePriceChange,
      handleLocationChange,
      handleDeleteItem: removeItem,
      handleDeleteOrder: removeAll,
      handleArchiveOrder,
      setEditingItem,
      setEditingLocation,
      resetForm
    }
  };
}
