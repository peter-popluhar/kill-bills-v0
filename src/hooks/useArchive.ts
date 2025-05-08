import { useState, useEffect } from 'react';
import { ref, onValue, Query, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';
import { ArchivedOrder } from '../types/ArchivedOrder';

export function useArchive() {
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const archiveRef: Query = query(
      ref(database, 'archive'),
      orderByChild('date')
    );

    const unsubscribe = onValue(
      archiveRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const orders: ArchivedOrder[] = Object.values(data);
            // Sort by date in descending order (newest first)
            orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setArchivedOrders(orders);
          } else {
            setArchivedOrders([]);
          }
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load archived orders'));
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { archivedOrders, isLoading, error };
} 
