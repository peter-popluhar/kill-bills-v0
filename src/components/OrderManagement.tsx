import React, { useRef } from 'react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { orderFormService } from '../services/orderFormService';

export const OrderManagement: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    orderItems,
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

  return (
    <div>
      <form ref={formRef} onSubmit={handlers.handleSubmit} className="order-form">
        <div className="form-group">
          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            required
          />
          <input
            type="number"
            name="itemInitialPrice"
            placeholder="Price"
            required
          />
          <select name="currency" defaultValue="CZK">
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
                  <form onSubmit={(e) => orderFormService.handleLocationSubmit(e, handlers.handleLocationChange)}>
                    <input
                      type="text"
                      name="location"
                      className="location-input"
                      defaultValue={summary.billLocation}
                      autoFocus
                    />
                  </form>
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
                  <span className="summary-value">{Number(total).toFixed(2)}</span>
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
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingItem === `${item.id}-name` ? (
                      <form onSubmit={(e) => orderFormService.handleNameSubmit(e, item, handlers.handleNameChange)}>
                        <input
                          type="text"
                          name="name"
                          defaultValue={item.itemName}
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span onClick={() => handlers.setEditingItem(`${item.id}-name`)}>
                        {item.itemName}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingItem === `${item.id}-price` ? (
                      <form onSubmit={(e) => orderFormService.handlePriceSubmit(e, item, handlers.handlePriceChange)}>
                        <input
                          type="number"
                          name="price"
                          defaultValue={item.itemInitialPrice}
                          autoFocus
                        />
                      </form>
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
