import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CitizenDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome, {user?.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/report"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Report New Issue</h2>
          <p className="text-blue-100">
            Report a civic issue in your area with photos and location
          </p>
        </Link>

        <Link
          to="/my-reports"
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">My Reports</h2>
          <p className="text-green-100">
            View and track the status of your reported issues
          </p>
        </Link>

        <Link
          to="/issues"
          className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">All Issues</h2>
          <p className="text-purple-100">
            Browse all reported issues in your area
          </p>
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboard;

