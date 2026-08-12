import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, token, loading, authHeader, API } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(false);

  useEffect(() => {
    if (user && token && location.pathname !== '/assessment' && !location.pathname.startsWith('/assessment/results')) {
      let isMounted = true;
      setCheckingSession(true);
      fetch(`${API}/api/assessment/current`, { headers: authHeader() })
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.inProgress) {
            navigate('/assessment', { replace: true });
          }
        })
        .catch(err => console.error('Error checking active session:', err))
        .finally(() => {
          if (isMounted) setCheckingSession(false);
        });

      return () => { isMounted = false; };
    }
  }, [location.pathname, user, token, API]);

  if (loading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#070B15]">
        <div className="w-8 h-8 border-2 border-[#004CE5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role separation guards
  const studentRoutes = ['/dashboard', '/assessment', '/knowledge', '/learning-path', '/ai-tutor'];

  if (user.role === 'admin' && studentRoutes.some(r => location.pathname === r || location.pathname.startsWith(`${r}/`))) {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'student' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
