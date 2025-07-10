import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      getCurrentUser();
    } else {
      setLoading(false);
    }
    
    // Set up token refresh interval (every 30 minutes)
    const refreshInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && user) {
        // Refresh user data to keep session alive
        getCurrentUser().catch(() => {
          // If refresh fails, sign out user
          signOut();
        });
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);
  
  // Listen for storage changes (user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed, sign out user
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Check for token expiration on page focus
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        getCurrentUser();
      } else if (!token && user) {
        setUser(null);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Get current user error:', error);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const response = await api.register(email, password, username);
    setUser(response.user);
  };

  const signIn = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
  };

  const signOut = async () => {
    api.setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}