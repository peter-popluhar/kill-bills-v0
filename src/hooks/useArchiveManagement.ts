import { ArchivedOrder } from '../types/ArchivedOrder';
import { useFirebaseCollection } from './useFirebaseCollection';
import { useCallback } from 'react';

export interface UseArchiveManagementReturn {
  archivedOrders: ArchivedOrder[];
  isLoading: boolean;
  error: Error | null;
  handleDeleteArchive: () => void;
}

export function useArchiveManagement(): UseArchiveManagementReturn {
  // Memoize the sort function to prevent recreating it on every render
  const sortOrders = useCallback((a: ArchivedOrder, b: ArchivedOrder) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  }, []);

  // Memoize the transform function
  const transformData = useCallback((data: Record<string, unknown>) => {
    const orders: ArchivedOrder[] = Object.entries(data)
      .map(([id, value]) => {
        try {
          const order = value as ArchivedOrder;
          if (!order || !Array.isArray(order.items)) {
            console.error('Invalid order structure:', value);
            return null;
          }
          return {
            ...order,
            archiveId: order.archiveId || id
          };
        } catch (err) {
          console.error('Error processing order:', err);
          return null;
        }
      })
      .filter((order): order is ArchivedOrder => order !== null)
      .sort(sortOrders);

    return orders;
  }, [sortOrders]);

  const {
    data: archivedOrders,
    isLoading,
    error,
    actions: { removeAll: handleDeleteArchive }
  } = useFirebaseCollection<ArchivedOrder>({
    collectionPath: 'archive',
    transformData
  });

  return {
    archivedOrders,
    isLoading,
    error,
    handleDeleteArchive
  };
} 
