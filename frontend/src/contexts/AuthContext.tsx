import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Set base URL for API calls (adjust if needed)
axios.defaults.baseURL = 'http://localhost:8000';

interface User {
  id: number;
  email: string;
  username: string;
  level: number;
  experience: number;
  coins: number;
  hearts: number;
  max_hearts: number;
  avatar_url?: string;
  boost_expires_at?: string;
  streak_count: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/users/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const res = await axios.post('/api/auth/login', formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);
    return userData;
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await axios.post('/api/auth/register', {
      email,
      username,
      password,
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
