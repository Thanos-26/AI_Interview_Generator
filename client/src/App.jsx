import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard';

// Layout component that conditionally renders Navbar
function AppLayout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-200 dark:bg-dark-bg dark:text-[#E6E1D8]">
      {/* Animated Background Mesh - hidden on auth page */}
      
      {!isAuthPage && <Navbar />}
      {children}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
