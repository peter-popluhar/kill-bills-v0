import { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue, push, set, update as firebaseUpdate, remove, DataSnapshot } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { useLoadingError } from './useLoadingError';

interface FirebaseCollectionOptions<T> {
  collectionPath: string;
  transformData?: (data: any) => T[];
  filterByUser?: boolean;
}

interface UseFirebaseCollectionReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  actions: {
    add: (item: Partial<T>) => Promise<void>;
    update: (id: string, updates: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    removeAll: () => Promise<void>;
  };
}

function areArraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useFirebaseCollection<T extends { id?: string; user?: string }>(
  options: FirebaseCollectionOptions<T>
): UseFirebaseCollectionReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const { isLoading, error, startLoading, stopLoading, setError } = useLoadingError();
  const { user, isAuthorized } = useAuth();
  const prevDataRef = useRef<T[]>([]);

  const { collectionPath, transformData, filterByUser = true } = options;

  useEffect(() => {
    let isSubscribed = true;

    if (!user || !isAuthorized) {
      setData([]);
      return;
    }

    startLoading();
    const collectionRef = ref(database, collectionPath);
    
    const unsubscribe = onValue(collectionRef, 
      (snapshot: DataSnapshot) => {
        if (!isSubscribed) return;

        try {
          const rawData = snapshot.val();
          let processedData: T[] = [];
          
          if (rawData) {
            if (transformData) {
              processedData = transformData(rawData);
            } else {
              processedData = Object.entries(rawData).map(([id, value]: [string, any]) => ({
                id,
                ...value
              })) as T[];
            }

            if (filterByUser) {
              processedData = processedData.filter(item => item.user === user.email);
            }
          }

          // Only update state if data has actually changed
          if (!areArraysEqual(processedData, prevDataRef.current)) {
            prevDataRef.current = processedData;
            setData(processedData);
          }
          
          stopLoading();
        } catch (err) {
          if (isSubscribed) {
            stopLoading(err instanceof Error ? err : new Error('Unknown error occurred'));
          }
        }
      },
      (error) => {
        if (isSubscribed) {
          stopLoading(error);
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [user, isAuthorized, collectionPath, transformData, filterByUser]);

  const add = async (item: Partial<T>) => {
    if (!user || !isAuthorized) return;

    try {
      const collectionRef = ref(database, collectionPath);
      const newRef = push(collectionRef);
      await set(newRef, {
        ...item,
        user: user.email
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error adding item'));
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    if (!user || !isAuthorized) return;

    try {
      const itemRef = ref(database, `${collectionPath}/${id}`);
      await firebaseUpdate(itemRef, updates);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error updating item'));
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    if (!user || !isAuthorized) return;

    try {
      const itemRef = ref(database, `${collectionPath}/${id}`);
      await remove(itemRef);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error removing item'));
      throw error;
    }
  };

  const removeAll = async () => {
    if (!user || !isAuthorized || !data.length) return;

    try {
      const collectionRef = ref(database, collectionPath);
      await remove(collectionRef);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error removing all items'));
      throw error;
    }
  };

  return {
    data,
    isLoading,
    error,
    actions: {
      add,
      update: updateItem,
      remove: removeItem,
      removeAll
    }
  };
} 
