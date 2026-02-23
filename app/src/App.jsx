import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SSEDataProvider } from './context/SSEDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import SSEToolkit from './pages/SSEToolkit';
import Analytics from './pages/Analytics';
import Results from './pages/Results';
import DimensionDistribution from './pages/DimensionDistribution';
import SchoolProfile from './pages/SchoolProfile';
import Support from './pages/Support';
import ParentSurvey from './pages/ParentSurvey';
import StudentSurvey from './pages/StudentSurvey';
import TeacherSurvey from './pages/TeacherSurvey';
import Login from './pages/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import UserManagement from './pages/admin/UserManagement';
import SchoolManagement from './pages/admin/SchoolManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function IndexRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router basename={import.meta.env.VITE_ROUTER_BASENAME || '/'}>
      <AuthProvider>
        <SSEDataProvider>
          <ErrorBoundary>
            <Routes>
              {/* Login page - public */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Home redirects intelligently based on role */}
              <Route path="/" element={<IndexRedirect />} />

              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/toolkit" element={<SSEToolkit />} />
                  <Route path="/school-profile" element={<SchoolProfile />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/results/dimension/:dimensionId" element={<DimensionDistribution />} />
                  <Route path="/support" element={<Support />} />
                </Route>
              </Route>

              {/* Analytics - Admin and Analyst only */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ANALYST']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/analytics" element={<Analytics />} />
                </Route>
              </Route>

              {/* Admin Management routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/schools" element={<SchoolManagement />} />
                </Route>
              </Route>

              {/* Public survey routes (no login required) */}
              <Route path="/survey/parent" element={<ParentSurvey />} />
              <Route path="/survey/parent/:parentId" element={<ParentSurvey />} />
              <Route path="/survey/student" element={<StudentSurvey />} />
              <Route path="/survey/student/:studentId" element={<StudentSurvey />} />
              <Route path="/survey/teacher" element={<TeacherSurvey />} />
              <Route path="/survey/teacher/:teacherId" element={<TeacherSurvey />} />

              {/* Unauthorized page */}
              <Route path="/unauthorized" element={
                <div className="unauthorized-page">
                  <h1>Access Denied</h1>
                  <p>You do not have permission to access this page.</p>
                  <a href="/dashboard">Go to Dashboard</a>
                </div>
              } />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ErrorBoundary>
        </SSEDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
