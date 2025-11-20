import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-blue-100">
            Manage users and their roles
          </p>
        </Link>

        <Link
          to="/admin/departments"
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Departments</h2>
          <p className="text-green-100">
            Manage departments
          </p>
        </Link>

        <Link
          to="/admin/authorities"
          className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Authorities</h2>
          <p className="text-purple-100">
            Manage authorities and their assignments
          </p>
        </Link>

        <Link
          to="/admin/flagged"
          className="bg-red-600 text-white p-6 rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Flagged Reports</h2>
          <p className="text-red-100">
            Review flagged issue reports
          </p>
        </Link>

        <Link
          to="/issues"
          className="bg-yellow-600 text-white p-6 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">All Issues</h2>
          <p className="text-yellow-100">
            View all issue reports
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

