import { useState, useRef } from 'react';
import { database } from '../firebase';
import { ref, push, set } from 'firebase/database';
import { OrderItem } from '../types/OrderItem';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseCollection } from './useFirebaseCollection';
import { useLoadingError } from './useLoadingError';

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
  const formRef = useRef<HTMLFormElement>(null);

  const { user, isAuthorized } = useAuth();
  const { setError } = useLoadingError();

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
    const currency = formData.get('currency') as string;

    if (!itemName || !itemInitialPrice) return;

    const itemsRef = ref(database, 'orderItems');
    const newItemRef = push(itemsRef);
    
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();

    const currentBillLocation = orderItems.length > 0 ? orderItems[0].billLocation : '';

    set(newItemRef, {
      itemName,
      itemInitialPrice,
      currency,
      itemCalculatedAmount: 1,
      itemCalculatedPrice: itemInitialPrice,
      currentDate,
      currentTime,
      user: user.email,
      billLocation: currentBillLocation,
    }).then(() => {
      form.reset();
      const currencySelect = form.querySelector('select[name="currency"]') as HTMLSelectElement;
      if (currencySelect) {
        currencySelect.value = 'CZK';
      }
    }).catch((error) => {
      setError(error instanceof Error ? error : new Error('Error adding new item'));
    });
  };

  const handleIncrementAmount = (item: OrderItem) => {
    const newAmount = (item.itemCalculatedAmount || 0) + 1;
    updateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount
    });
  };

  const handleDecrementAmount = (item: OrderItem) => {
    if (item.itemCalculatedAmount <= 1) return;
    const newAmount = item.itemCalculatedAmount - 1;
    updateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount
    });
  };

  const handleNameChange = (item: OrderItem, newName: string) => {
    updateItem(item.id!, { itemName: newName });
    setEditingItem(null);
  };

  const handlePriceChange = (item: OrderItem, newPrice: number) => {
    updateItem(item.id!, {
      itemInitialPrice: newPrice,
      itemCalculatedPrice: newPrice * (item.itemCalculatedAmount || 1)
    });
    setEditingItem(null);
  };

  const handleLocationChange = (newLocation: string) => {
    if (!user || !isAuthorized) return;

    const updates = orderItems.reduce((acc, item) => ({
      ...acc,
      [`orderItems/${item.id}/billLocation`]: newLocation
    }), {});

    const itemsRef = ref(database, '');
    set(itemsRef, updates).catch((error) => {
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
        currency: item.currency
      })),
      user: user.email,
      totalsByCurrency: orderItems.reduce((acc, item) => {
        const currency = item.currency;
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

    const itemCount = orderItems.length;
    const lastOrder = orderItems.reduce((latest, current) => {
      const latestDate = new Date(`${latest.currentDate} ${latest.currentTime}`);
      const currentDate = new Date(`${current.currentDate} ${current.currentTime}`);
      return currentDate > latestDate ? current : latest;
    }, orderItems[0]);

    const totalsByCurrency = orderItems.reduce((acc, item) => {
      const currency = item.currency;
      acc[currency] = (acc[currency] || 0) + item.itemCalculatedPrice;
      return acc;
    }, {} as { [key: string]: number });

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
    summary: calculateSummary(),
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
