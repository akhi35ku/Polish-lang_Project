import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Restoring session…" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
