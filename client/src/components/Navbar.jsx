import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { HiMoon, HiSun } from 'react-icons/hi';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { darkMode, toggleTheme } = useContext(AppContext);

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center sticky top-0 z-[100] backdrop-blur-md border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40">
      <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
        INTERVIEW.SIM
      </Link>
      
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full border border-gray-500/10 hover:bg-gray-500/10 transition">
          {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5 text-slate-700" />}
        </button>
        <UserDropdown />
      </div>
    </nav>
  );
};

export default Navbar;