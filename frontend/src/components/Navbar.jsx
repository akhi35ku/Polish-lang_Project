import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out. See you soon!');
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/40 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base text-white shadow-lg shadow-indigo-600/30">🔐</span>
          Auth App
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="btn-small !px-2.5"
            title="Toggle dark / light mode"
            aria-label="Toggle dark or light mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/support" className="btn-small hidden sm:inline-flex">Support</Link>
          {user ? (
            <>
              <Link to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="btn-small">
                {user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="btn-primary !px-4 !py-1.5 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-small">Login</Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5 text-sm">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
