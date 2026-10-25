import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { HiMoon, HiSun } from 'react-icons/hi';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { darkMode, toggleTheme } = useContext(AppContext);
  return (
    <nav className="sticky top-0 z-[100] flex w-full items-center justify-between border-b border-rule bg-paper px-6 py-4 dark:border-white/10 dark:bg-dark-bg">
      <Link to="/home" className="font-serif text-2xl font-medium tracking-tight text-ink dark:text-[#E6E1D8]">Interview Sim</Link>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center border border-rule text-ink transition-colors hover:bg-[#F0EEE8] dark:border-white/15 dark:text-[#E6E1D8] dark:hover:bg-white/5">
          {darkMode ? <HiSun className="h-4 w-4" /> : <HiMoon className="h-4 w-4" />}
        </button>
        <UserDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
