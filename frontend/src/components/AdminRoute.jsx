import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Checking access…" />
      </div>
    );
  // Hidden panel: non-admins are silently bounced to the public home page
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}
