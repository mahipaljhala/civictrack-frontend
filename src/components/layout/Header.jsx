import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin, isAuthority, isCitizen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              CivicTrack
            </Link>
            <nav className="ml-8 flex space-x-4">
              {user && (
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </Link>
                  {isCitizen && (
                    <>
                      <Link
                        to="/report"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Report Issue
                      </Link>
                      <Link
                        to="/my-reports"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Reports
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/users"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Users
                      </Link>
                      <Link
                        to="/admin/departments"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Departments
                      </Link>
                      <Link
                        to="/admin/authorities"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Authorities
                      </Link>
                      <Link
                        to="/admin/categories"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Categories
                      </Link>
                      <Link
                        to="/admin/flagged"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Flagged Reports
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

