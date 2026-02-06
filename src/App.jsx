import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SSEDataProvider } from './context/SSEDataContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import SSEToolkit from './pages/SSEToolkit';
import Analytics from './pages/Analytics';
import Results from './pages/Results';
import SchoolProfile from './pages/SchoolProfile';
import Support from './pages/Support';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <SSEDataProvider>
        <Router>
        <Routes>
          {/* Home redirects to toolkit */}
          <Route path="/" element={<Navigate to="/toolkit" replace />} />

          {/* Main app layout with sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/toolkit" element={<SSEToolkit />} />
            <Route path="/school-profile" element={<SchoolProfile />} />
            <Route path="/results" element={<Results />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/toolkit" replace />} />
        </Routes>
        </Router>
      </SSEDataProvider>
    </ThemeProvider>
  );
}

export default App;

