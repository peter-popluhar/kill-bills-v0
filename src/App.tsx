import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { OrderManagement } from './components/OrderManagement';
import './App.css';

function App() {
  const { user, logout, isAuthorized } = useAuth();

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
      
      <OrderManagement />
    </div>
  );
}

export default App;
