import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

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

  // Simplified authorization check that doesn't use database read or domain checks
  const checkAuthorization = async (user: User | null) => {
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    try {
      // Simply check if the user has a verified email
      // This uses data already available in the authentication response
      const isVerified = user.emailVerified;
      
      // Set authorization status based on email verification
      setIsAuthorized(isVerified);
      
      // If not authorized, sign out
      if (!isVerified) {
        console.log('User email is not verified');
        await signOut(auth);
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
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
