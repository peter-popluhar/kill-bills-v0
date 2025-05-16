import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { OrderItemComponent } from './OrderItemComponent';
import { OrderItem } from '../../types/OrderItem';

interface OrderItemListProps {
  orderItems: OrderItem[];
  currency: string;
  exchangeRate?: number;
  onIncrementAmount: (item: OrderItem) => void;
  onDecrementAmount: (item: OrderItem) => void;
  onEditName: (item: OrderItem) => void;
  onEditPrice: (item: OrderItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const OrderItemList: React.FC<OrderItemListProps> = ({
  orderItems,
  currency,
  exchangeRate,
  onIncrementAmount,
  onDecrementAmount,
  onEditName,
  onEditPrice,
  onDeleteItem
}) => {
  // Manage expanded state internally
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <Stack spacing={2}>
      {[...orderItems].reverse().map((item) => {
        const convertedPrice = exchangeRate && currency === 'EUR' 
          ? `${(Number(item.itemCalculatedPrice) * exchangeRate).toFixed(2)} CZK` 
          : undefined;
          
        return (
          <OrderItemComponent
            key={item.id}
            item={item}
            currency={currency}
            isExpanded={!!expandedItems[item.id!]}
            convertedPrice={convertedPrice}
            onToggleExpand={() => toggleExpand(item.id!)}
            onIncrementAmount={() => onIncrementAmount(item)}
            onDecrementAmount={() => onDecrementAmount(item)}
            onEditName={() => onEditName(item)}
            onEditPrice={() => onEditPrice(item)}
            onDelete={() => onDeleteItem(item.id!)}
          />
        );
      })}
    </Stack>
  );
};
