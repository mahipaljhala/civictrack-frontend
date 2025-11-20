import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/Dashboard';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import MyReports from './pages/citizen/MyReports';

// Authority Pages
import AuthorityDashboard from './pages/authority/Dashboard';
import AssignedIssues from './pages/authority/AssignedIssues';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AuthorityManagement from './pages/admin/AuthorityManagement';
import AuthorityUserManagement from './pages/admin/AuthorityUserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import FlaggedReports from './pages/admin/FlaggedReports';

// Common Pages
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import NotFound from './pages/NotFound';

// Home page component that shows different content based on user role
const HomePage = () => {
  const { isAuthority, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // For authority users, show assigned issues
  if (isAuthority) {
    return <AssignedIssues />;
  }

  // For everyone else (citizens, admins), show all issues
  return <IssueList />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes - Home page */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Citizen Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute requiredRole="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute requiredRole="citizen">
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute requiredRole="citizen">
            <MyReports />
          </ProtectedRoute>
        }
      />

      {/* Authority Routes */}
      <Route
        path="/authority/dashboard"
        element={
          <ProtectedRoute requiredRole="authority">
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/issues"
        element={
          <ProtectedRoute requiredRole="authority">
            <AssignedIssues />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute requiredRole="admin">
            <DepartmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/authorities"
        element={
          <ProtectedRoute requiredRole="admin">
            <AuthorityManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/authority-users"
        element={
          <ProtectedRoute requiredRole="admin">
            <AuthorityUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requiredRole="admin">
            <CategoryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/flagged"
        element={
          <ProtectedRoute requiredRole="admin">
            <FlaggedReports />
          </ProtectedRoute>
        }
      />

      {/* Common Routes - Keep /issues as an alias */}
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <IssueList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/:id"
        element={
          <ProtectedRoute>
            <IssueDetail />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
