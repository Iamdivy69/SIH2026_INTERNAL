import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Login() {
  const { login, API } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Unable to connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen portal-grid-bg text-black dark:text-[#F3F4F6] flex flex-col transition-colors duration-200 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed -top-24 -right-24 h-[440px] w-[440px] rounded-full bg-[#004CE5]/15 dark:bg-[#004CE5]/20 blur-[100px] animate-blob-1" />
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-[440px] w-[440px] rounded-full bg-[#004CE5]/10 dark:bg-[#004CE5]/15 blur-[100px] animate-blob-2" />

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="btn-ghost p-2"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#004CE5] mb-2 shadow-md">
              <span className="text-white text-xl font-bold">P</span>
            </div>
            <h1 className="text-[40px] font-extrabold text-black dark:text-[#F3F4F6]">Welcome back</h1>
            <p className="text-base text-[#64748B] dark:text-[#94A3B8]">
              Sign in to your PARAKH AI account
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="chip chip-red w-full px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-black dark:text-[#F3F4F6]">
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-black dark:text-[#F3F4F6]">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-medium text-[#011A53] dark:text-[#8BB8FF] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
