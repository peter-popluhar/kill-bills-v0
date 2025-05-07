import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authorization by attempting to read from the database
  const checkAuthorization = async (user: User | null) => {
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    try {
      // Try to read from the database - this will fail if not authorized
      const testRef = ref(database, 'orderItems');
      await get(testRef);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
      // Sign out if not authorized
      await signOut(auth);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      await checkAuthorization(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkAuthorization(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthorized(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthorized,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
