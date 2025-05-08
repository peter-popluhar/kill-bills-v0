import { useArchiveManagement } from '../hooks/useArchiveManagement';
import { ArchivedOrder } from '../types/ArchivedOrder';

const ArchiveCard = ({ order }: { order: ArchivedOrder }) => (
  <div className="archive-card">
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
          <div key={`${order.archiveId}-${index}`} className="archive-card-item">
            <span className="item-name">{item.itemName}</span>
            <span className="item-details">
              {item.itemCalculatedAmount}x {item.itemInitialPrice} {item.currency}
            </span>
          </div>
        ))}
      </div>

      <div className="archive-card-totals">
        {Object.entries(order.totalsByCurrency).map(([currency, total]) => (
          <div key={`${order.archiveId}-${currency}`} className="total-amount">
            Total: {total.toFixed(2)} {currency}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ArchiveHeader = ({ onDelete }: { onDelete: () => void }) => (
  <div className="archive-header">
    <h2>Archived Orders</h2>
    <button 
      onClick={onDelete}
      className="delete-button"
    >
      Delete All Archives
    </button>
  </div>
);

export const ArchiveManagement = () => {
  const { archivedOrders, isLoading, error, handleDeleteArchive } = useArchiveManagement();

  if (isLoading) {
    return <div className="loading">Loading archived orders...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading archived orders</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!archivedOrders.length) {
    return null;
  }

  return (
    <div className="archive-items">
      <ArchiveHeader onDelete={handleDeleteArchive} />
      <div className="archive-grid">
        {archivedOrders.map((order) => (
          <ArchiveCard key={order.archiveId} order={order} />
        ))}
      </div>
    </div>
  );
}; 
