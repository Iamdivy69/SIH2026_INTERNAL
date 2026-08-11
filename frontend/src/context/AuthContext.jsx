import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('parakh-token'));
  const [loading, setLoading] = useState(true);

  // On mount, try to restore user from stored token
  useEffect(() => {
    if (token) {
      // Decode payload (no verification — backend protects routes)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check expiry
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, name: payload.name, email: payload.email, role: payload.role });
        } else {
          // Expired — clear
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenStr, userData) => {
    localStorage.setItem('parakh-token', tokenStr);
    setToken(tokenStr);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('parakh-token');
    setToken(null);
    setUser(null);
  };

  const authHeader = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authHeader, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
