import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, push, set, update, remove, DataSnapshot } from 'firebase/database';
import { OrderItem } from '../types/OrderItem';
import { useAuth } from '../contexts/AuthContext';

export const OrderManagement: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [newItem, setNewItem] = useState<Partial<OrderItem>>({
    currency: 'CZK',
    itemCalculatedAmount: 1,
    itemInitialAmount: 1,
  });
  const { user, isAuthorized } = useAuth();

  useEffect(() => {
    if (!user || !isAuthorized) return;

    // Create a reference to the orderItems in the database
    const itemsRef = ref(database, 'orderItems');
    
    // Listen for changes in the data
    const unsubscribe = onValue(itemsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object of items to an array and filter by user
        const itemsArray: OrderItem[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({
            id,
            ...value
          }))
          .filter((item) => item.user === user.email);
        setOrderItems(itemsArray);
      } else {
        setOrderItems([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, isAuthorized]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!user || !isAuthorized || !newItem.itemName) return;

    // Create a reference to the orderItems collection
    const itemsRef = ref(database, 'orderItems');
    
    // Generate a new item with a unique key
    const newItemRef = push(itemsRef);
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();

    // Get the current bill location from existing items if any
    const currentBillLocation = orderItems.length > 0 ? orderItems[0].billLocation : '';

    // Set the value of the new item
    set(newItemRef, {
      ...newItem,
      currentDate,
      currentTime,
      user: user.email,
      billLocation: currentBillLocation,
      itemCalculatedPrice: newItem.itemInitialPrice,
      archiveId: Math.floor(Math.random() * 1000)
    });

    // Clear the form
    setNewItem({
      currency: 'CZK',
      itemCalculatedAmount: 1,
      itemInitialAmount: 1,
    });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<OrderItem>) => {
    if (!user || !isAuthorized) return;

    const itemRef = ref(database, `orderItems/${itemId}`);
    update(itemRef, updates);
  };

  const handleIncrementAmount = (item: OrderItem) => {
    const newAmount = (item.itemCalculatedAmount || 0) + 1;
    handleUpdateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount
    });
  };

  const handleDecrementAmount = (item: OrderItem) => {
    if (item.itemCalculatedAmount <= 1) return;
    const newAmount = item.itemCalculatedAmount - 1;
    handleUpdateItem(item.id!, {
      itemCalculatedAmount: newAmount,
      itemCalculatedPrice: (item.itemInitialPrice || 0) * newAmount
    });
  };

  const handleNameChange = (item: OrderItem, newName: string) => {
    handleUpdateItem(item.id!, { itemName: newName });
    setEditingItem(null);
  };

  const handlePriceChange = (item: OrderItem, newPrice: number) => {
    handleUpdateItem(item.id!, {
      itemInitialPrice: newPrice,
      itemCalculatedPrice: newPrice * (item.itemCalculatedAmount || 1)
    });
    setEditingItem(null);
  };

  const handleLocationChange = (newLocation: string) => {
    if (!user || !isAuthorized) return;

    orderItems.forEach(item => {
      const itemRef = ref(database, `orderItems/${item.id}`);
      update(itemRef, { billLocation: newLocation });
    });
    setEditingLocation(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!user || !isAuthorized) return;
    const itemRef = ref(database, `orderItems/${itemId}`);
    remove(itemRef);
  };

  const handleDeleteOrder = () => {
    if (!user || !isAuthorized || !orderItems.length) return;

    orderItems.forEach(item => {
      const itemRef = ref(database, `orderItems/${item.id}`);
      remove(itemRef);
    });
  };

  const calculateSummary = () => {
    if (!orderItems.length) return { totalAmount: 0, itemCount: 0, lastOrder: null, billLocation: '' };

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

  if (!user || !isAuthorized) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <input
            type="text"
            value={newItem.itemName || ''}
            onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
            placeholder="Item Name"
            required
          />
          <input
            type="number"
            value={newItem.itemInitialPrice || ''}
            onChange={(e) => setNewItem({...newItem, itemInitialPrice: Number(e.target.value)})}
            placeholder="Price"
            required
          />
          <select
            value={newItem.currency}
            onChange={(e) => setNewItem({...newItem, currency: e.target.value})}
          >
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button type="submit">Add Item</button>
      </form>

      {orderItems.length > 0 && (
        <div className="order-items">
          <h2>Your Items</h2>
          
          <div className="summary-panel">
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{calculateSummary().itemCount}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Bill Location:</span>
                {editingLocation ? (
                  <input
                    type="text"
                    className="location-input"
                    defaultValue={calculateSummary().billLocation}
                    onBlur={(e) => handleLocationChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLocationChange(e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span 
                    className="summary-value location-value" 
                    onClick={() => setEditingLocation(true)}
                  >
                    {calculateSummary().billLocation || 'Click to set location'}
                  </span>
                )}
              </div>
              
              {Object.entries(calculateSummary().totalsByCurrency ?? {}).map(([currency, total]) => (
                <div key={currency} className="summary-item">
                  <span className="summary-label">Total ({currency}):</span>
                  <span className="summary-value">{total.toFixed(2)}</span>
                </div>
              ))}
              
              {calculateSummary().lastOrder && (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Last Order:</span>
                    <span className="summary-value">{calculateSummary().lastOrder?.itemName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Last Order Time:</span>
                    <span className="summary-value">
                      {calculateSummary().lastOrder?.currentDate} {calculateSummary().lastOrder?.currentTime}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="summary-actions">
              <button 
                onClick={handleDeleteOrder}
                className="delete-button"
              >
                Delete Order
              </button>
              <button 
                className="action-button"
              >
                Archive Order
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingItem === `${item.id}-name` ? (
                      <input
                        type="text"
                        defaultValue={item.itemName}
                        onBlur={(e) => handleNameChange(item, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleNameChange(item, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => setEditingItem(`${item.id}-name`)}>
                        {item.itemName}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingItem === `${item.id}-price` ? (
                      <input
                        type="number"
                        defaultValue={item.itemInitialPrice}
                        onBlur={(e) => handlePriceChange(item, Number(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlePriceChange(item, Number(e.currentTarget.value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => setEditingItem(`${item.id}-price`)}>
                        {item.itemInitialPrice}
                      </span>
                    )}
                    {item.currency}
                  </td>
                  <td>
                    <button onClick={() => handleDecrementAmount(item)}>-</button>
                    {item.itemCalculatedAmount}
                    <button onClick={() => handleIncrementAmount(item)}>+</button>
                  </td>
                  <td>{item.itemCalculatedPrice} {item.currency}</td>
                  <td>{item.currentDate}</td>
                  <td>{item.currentTime}</td>
                  <td className="actions">
                    <button onClick={() => setEditingItem(`${item.id}-name`)}>Edit Name</button>
                    <button onClick={() => setEditingItem(`${item.id}-price`)}>Edit Price</button>
                    <button 
                      onClick={() => handleDeleteItem(item.id!)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 
