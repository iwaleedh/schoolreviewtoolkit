import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SSEDataProvider } from './context/SSEDataContext';
import { ThemeProvider } from './context/ThemeContext';
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
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <SSEDataProvider>
        <Router basename={import.meta.env.VITE_ROUTER_BASENAME || '/'}>
          <ErrorBoundary>
            <Routes>
              {/* Home redirects to toolkit */}
              <Route path="/" element={<Navigate to="/toolkit" replace />} />

              {/* Main app layout with sidebar */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/toolkit" element={<SSEToolkit />} />
                <Route path="/school-profile" element={<SchoolProfile />} />
                <Route path="/results" element={<Results />} />
                <Route path="/results/dimension/:dimensionId" element={<DimensionDistribution />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/support" element={<Support />} />
              </Route>

              {/* Public survey routes (no login required) */}
              <Route path="/survey/parent" element={<ParentSurvey />} />
              <Route path="/survey/parent/:parentId" element={<ParentSurvey />} />
              <Route path="/survey/student" element={<StudentSurvey />} />
              <Route path="/survey/student/:studentId" element={<StudentSurvey />} />
              <Route path="/survey/teacher" element={<TeacherSurvey />} />
              <Route path="/survey/teacher/:teacherId" element={<TeacherSurvey />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/toolkit" replace />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </SSEDataProvider>
    </ThemeProvider>
  );
}

export default App;
