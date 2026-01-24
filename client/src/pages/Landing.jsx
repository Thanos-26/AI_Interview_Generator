import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import SetupModal from '../components/SetupModal';

const Landing = () => {
  const { setIsConfigOpen, isAuthenticated } = useContext(AppContext);

  const handleStartClick = () => {
    // If user is logged in, directly open setup
    // If not logged in, modal will handle auth
    setIsConfigOpen(true);
  };

  return (
    <main className="max-w-6xl mx-auto flex flex-col items-center justify-center pt-32 text-center px-4 space-y-8 animate-in fade-in duration-700">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
        Master Your <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">
          Career Logic.
        </span>
      </h1>

      <p className="text-gray-500 dark:text-gray-400 max-w-xl text-lg md:text-xl">
        The AI-conducted simulation platform that adapts to your skills and provides real-time objective feedback.
      </p>

      <button 
        onClick={handleStartClick}
        className="px-12 py-5 bg-purple-600 text-white rounded-full font-bold shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform"
      >
        {isAuthenticated ? "Start Session" : "Start Free Session"}
      </button>

      <SetupModal />
    </main>
  );
};

export default Landing;
