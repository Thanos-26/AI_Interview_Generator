import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-slate-200 transition-colors duration-300">
          {/* Animated Background Mesh */}
          <div className="fixed inset-0 z-[-1] opacity-40 dark:opacity-100">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(168,85,247,0.15),transparent_40%)] dark:bg-[radial-gradient(circle_at_10%_10%,_rgba(88,28,135,0.15),transparent_40%)]" />
          </div>
          
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;