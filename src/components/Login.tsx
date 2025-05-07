import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signInWithGoogle, user } = useAuth();

  return (
    <div className="login-container">
      <h1>Welcome to Kill Bills</h1>
      {user ? (
        <div className="error-message">
          <p>Access Denied</p>
          <p>You are not authorized to use this application.</p>
        </div>
      ) : (
        <button 
          className="google-signin-button"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
} 
