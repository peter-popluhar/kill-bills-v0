import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, remove, DataSnapshot } from 'firebase/database';
import { OrderItem } from '../types/OrderItem';
import { useAuth } from '../contexts/AuthContext';

interface ArchivedOrderItem {
  itemName: string;
  itemInitialPrice: number;
  itemCalculatedAmount: number;
  itemCalculatedPrice: number;
  currency: string;
}

interface ArchivedOrder {
  archiveId: string;
  date: string;
  time: string;
  location: string;
  items: ArchivedOrderItem[];
  totalsByCurrency: { [key: string]: number };
  user: string;
}

export const ArchiveManagement: React.FC = () => {
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>([]);
  const { user, isAuthorized } = useAuth();

  useEffect(() => {
    if (!user || !isAuthorized) return;

    const archiveRef = ref(database, 'archive');
    
    const unsubscribe = onValue(archiveRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object of archived orders to an array and filter by user
        const orders: ArchivedOrder[] = Object.values(data)
          .map((order: unknown) => {
            // Validate the order structure
            const typedOrder = order as ArchivedOrder;
            if (!typedOrder || !Array.isArray(typedOrder.items)) {
              console.error('Invalid order structure:', order);
              return null;
            }
            return typedOrder;
          })
          .filter((order): order is ArchivedOrder => 
            order !== null && order.user === user.email
          );

        // Sort orders by date and time (newest first)
        orders.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        setArchivedOrders(orders);
      } else {
        setArchivedOrders([]);
      }
    });

    return () => unsubscribe();
  }, [user, isAuthorized]);

  const handleDeleteArchive = () => {
    if (!user || !isAuthorized || !archivedOrders.length) return;

    const archiveRef = ref(database, 'archive');
    
    // Remove all archived orders for the user
    remove(archiveRef).catch((error) => {
      console.error('Error deleting archive:', error);
    });
  };

  if (!user || !isAuthorized) {
    return null;
  }

  return (
    <div>
      {archivedOrders.length > 0 && (
        <div className="archive-items">
          <div className="archive-header">
            <h2>Archived Orders</h2>
            <button 
              onClick={handleDeleteArchive}
              className="delete-button"
            >
              Delete Archive
            </button>
          </div>
          
          <div className="archive-grid">
            {archivedOrders.map((order) => (
              <div key={order.archiveId} className="archive-card">
                <div className="archive-card-header">
                  <div className="archive-card-date">
                    {order.date} {order.time}
                  </div>
                  <div className="archive-card-location">
                    <span className="location-label">Location: </span>
                    {order.location || 'No location'}
                  </div>
                </div>

                <div className="archive-card-content">
                  <div className="archive-card-items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="archive-card-item">
                        <span className="item-name">{item.itemName}</span>
                        <span className="item-details">
                          {item.itemCalculatedAmount}x {item.itemInitialPrice} {item.currency}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="archive-card-totals">
                    {Object.entries(order.totalsByCurrency).map(([currency, total]) => (
                      <div key={currency} className="total-amount">
                        Total: {total.toFixed(2)} {currency}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
