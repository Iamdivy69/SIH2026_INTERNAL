import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

const navItems = [
  { to: '/dashboard',      label: 'Dashboard' },
  { to: '/assessment',     label: 'Assessment' },
  { to: '/knowledge',      label: 'Knowledge' },
  { to: '/learning-path',  label: 'Learning Path' },
  { to: '/ai-tutor',       label: 'AI Tutor' },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAssessment = location.pathname === '/assessment';

  const handleLogout = () => {
    if (isAssessment) return;
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen portal-grid-bg text-black dark:text-[#F3F4F6] flex flex-col transition-colors duration-200 overflow-x-hidden">
      {/* Ambient moving background glows */}
      <div className="pointer-events-none fixed -top-24 -right-24 h-[450px] w-[450px] rounded-full bg-[#004CE5]/15 dark:bg-[#004CE5]/20 blur-[100px] animate-blob-1" />
      <div className="pointer-events-none fixed top-1/3 -left-32 h-[400px] w-[400px] rounded-full bg-[#0038A8]/10 dark:bg-[#004CE5]/15 blur-[100px] animate-blob-2" />
      <div className="pointer-events-none fixed -bottom-24 right-1/4 h-[420px] w-[420px] rounded-full bg-[#004CE5]/10 dark:bg-[#0038A8]/15 blur-[100px] animate-blob-3" />

      {!isAssessment && (
        <header className="sticky top-0 z-40 border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-white/95 dark:bg-[#0F1525]/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0F1525]/80 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#004CE5] flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <span className="font-bold text-base text-black dark:text-[#F3F4F6] tracking-tight">PARAKH AI</span>
              </NavLink>

              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      Admin
                    </NavLink>
                  )}
                </nav>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  className="btn-ghost p-2"
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>

                {user && (
                  <>
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-sm font-medium text-black dark:text-[#F3F4F6] leading-tight">{user.name}</span>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] capitalize">{user.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-1.5">
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
