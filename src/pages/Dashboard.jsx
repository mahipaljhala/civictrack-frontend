import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin, isAuthority, isCitizen, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthority) {
    return <Navigate to="/authority/dashboard" replace />;
  }

  if (isCitizen) {
    return <Navigate to="/citizen/dashboard" replace />;
  }

  // Fallback if user has no role
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">No Role Assigned</h1>
        <p className="text-gray-600">Please contact an administrator to assign you a role.</p>
      </div>
    </div>
  );
};

export default Dashboard;

