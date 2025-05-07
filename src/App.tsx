import React from 'react';
import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, push, set, DataSnapshot } from 'firebase/database';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { OrderItem } from './types/OrderItem';
import './App.css';

function App() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<OrderItem>>({
    currency: 'CZK',
    itemCalculatedAmount: 1,
    itemInitialAmount: 1,
  });
  const { user, logout, isAuthorized } = useAuth();

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
    if (!user || !isAuthorized || !newItem.itemName || !newItem.billLocation) return;

    // Create a reference to the orderItems collection
    const itemsRef = ref(database, 'orderItems');
    
    // Generate a new item with a unique key
    const newItemRef = push(itemsRef);
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString();
    const currentTime = now.toLocaleTimeString();

    // Set the value of the new item
    set(newItemRef, {
      ...newItem,
      currentDate,
      currentTime,
      user: user.email,
      itemCalculatedPrice: newItem.itemInitialPrice,
      archiveId: Math.floor(Math.random() * 1000) // You might want to implement a proper ID generation
    });

    // Clear the form
    setNewItem({
      currency: 'CZK',
      itemCalculatedAmount: 1,
      itemInitialAmount: 1,
    });
  };

  if (!user || !isAuthorized) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kill Bills</h1>
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
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
            type="text"
            value={newItem.billLocation || ''}
            onChange={(e) => setNewItem({...newItem, billLocation: e.target.value})}
            placeholder="Bill Location"
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

      <div className="order-items">
        <h2>Your Items</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Price</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.billLocation}</td>
                <td>{item.itemCalculatedPrice} {item.currency}</td>
                <td>{item.currentDate}</td>
                <td>{item.currentTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
