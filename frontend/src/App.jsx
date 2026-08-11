import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login        from './pages/Login';
import Signup       from './pages/Signup';
import Dashboard    from './pages/Dashboard';
import Assessment   from './pages/Assessment';
import Results      from './pages/Results';
import Knowledge    from './pages/Knowledge';
import LearningPath from './pages/LearningPath';
import AiTutor      from './pages/AiTutor';
import Admin        from './pages/Admin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Layout><Assessment /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessment/results" element={
            <ProtectedRoute>
              <Layout><Results /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge" element={
            <ProtectedRoute>
              <Layout><Knowledge /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/learning-path" element={
            <ProtectedRoute>
              <Layout><LearningPath /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai-tutor" element={
            <ProtectedRoute>
              <Layout><AiTutor /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout><Admin /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
