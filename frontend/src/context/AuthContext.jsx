import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('parakh-token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser({
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          hasCompletedDiagnostic: !!data.user.hasCompletedDiagnostic,
        });
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  // On mount, try to restore user from stored token and fetch full profile
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            hasCompletedDiagnostic: false,
          });
          refreshUser();
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

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
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, authHeader, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
