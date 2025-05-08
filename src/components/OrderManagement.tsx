import React from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { OrderItem } from '../types/OrderItem';

export const OrderManagement: React.FC = () => {
  const {
    orderItems,
    newItem,
    editingItem,
    editingLocation,
    isLoading,
    error,
    summary,
    handlers
  } = useOrderManagement();

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading orders</p>
        <p>{error.message}</p>
      </div>
    );
  }

  console.log('test orders')

  return (
    <div>
      <form onSubmit={handlers.handleSubmit} className="order-form">
        <div className="form-group">
          <input
            type="text"
            value={newItem.itemName || ''}
            onChange={(e) => handlers.setNewItem({ itemName: e.target.value })}
            placeholder="Item Name"
            required
          />
          <input
            type="number"
            value={newItem.itemInitialPrice || ''}
            onChange={(e) => handlers.setNewItem({ itemInitialPrice: Number(e.target.value) })}
            placeholder="Price"
            required
          />
          <select
            value={newItem.currency}
            onChange={(e) => handlers.setNewItem({ currency: e.target.value })}
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
                <span className="summary-value">{summary.itemCount}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Bill Location:</span>
                {editingLocation ? (
                  <input
                    type="text"
                    className="location-input"
                    defaultValue={summary.billLocation}
                    onBlur={(e) => handlers.handleLocationChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handlers.handleLocationChange(e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span 
                    className="summary-value location-value" 
                    onClick={() => handlers.setEditingLocation(true)}
                  >
                    {summary.billLocation || 'Click to set location'}
                  </span>
                )}
              </div>
              
              {Object.entries(summary.totalsByCurrency).map(([currency, total]) => (
                <div key={currency} className="summary-item">
                  <span className="summary-label">Total ({currency}):</span>
                  <span className="summary-value">{total.toFixed(2)}</span>
                </div>
              ))}
              
              {summary.lastOrder && (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Last Order:</span>
                    <span className="summary-value">{summary.lastOrder.itemName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Last Order Time:</span>
                    <span className="summary-value">
                      {summary.lastOrder.currentDate} {summary.lastOrder.currentTime}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="summary-actions">
              <button 
                onClick={handlers.handleDeleteOrder}
                className="delete-button"
              >
                Delete Order
              </button>
              <button 
                onClick={handlers.handleArchiveOrder}
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
              {orderItems.map((item: OrderItem) => (
                <tr key={item.id}>
                  <td>
                    {editingItem === `${item.id}-name` ? (
                      <input
                        type="text"
                        defaultValue={item.itemName}
                        onBlur={(e) => handlers.handleNameChange(item, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlers.handleNameChange(item, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => handlers.setEditingItem(`${item.id}-name`)}>
                        {item.itemName}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingItem === `${item.id}-price` ? (
                      <input
                        type="number"
                        defaultValue={item.itemInitialPrice}
                        onBlur={(e) => handlers.handlePriceChange(item, Number(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlers.handlePriceChange(item, Number(e.currentTarget.value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => handlers.setEditingItem(`${item.id}-price`)}>
                        {item.itemInitialPrice}
                      </span>
                    )}
                    {item.currency}
                  </td>
                  <td>
                    <button onClick={() => handlers.handleDecrementAmount(item)}>-</button>
                    {item.itemCalculatedAmount}
                    <button onClick={() => handlers.handleIncrementAmount(item)}>+</button>
                  </td>
                  <td>{item.itemCalculatedPrice} {item.currency}</td>
                  <td>{item.currentDate}</td>
                  <td>{item.currentTime}</td>
                  <td className="actions">
                    <button onClick={() => handlers.setEditingItem(`${item.id}-name`)}>Edit Name</button>
                    <button onClick={() => handlers.setEditingItem(`${item.id}-price`)}>Edit Price</button>
                    <button 
                      onClick={() => handlers.handleDeleteItem(item.id!)}
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
