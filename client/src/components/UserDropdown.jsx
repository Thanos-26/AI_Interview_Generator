import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AppContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const initials = (user?.name || user?.email || 'U').split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path) => { setIsOpen(false); navigate(path); };
  const handleLogout = () => { setIsOpen(false); logout(); navigate('/'); };
  if (!isAuthenticated) return null;

  return <div className="relative" ref={dropdownRef}>
    <button onClick={() => setIsOpen(!isOpen)} className="h-9 w-9 overflow-hidden border border-rule bg-[#EFEEE9] text-xs font-medium text-ink dark:border-white/15 dark:bg-white/10 dark:text-[#E6E1D8]">
      {user?.picture ? <img src={user.picture} alt="User" className="h-full w-full object-cover" /> : initials}
    </button>
    {isOpen && <div className="absolute right-0 z-[110] mt-2 w-56 border border-rule bg-white py-1 shadow-sm dark:border-white/15 dark:bg-[#16191F]">
      <div className="border-b border-rule px-4 py-3 dark:border-white/10"><p className="text-[10px] uppercase tracking-[.14em] text-muted">Candidate Mode</p><p className="mt-1 truncate text-sm font-medium">{user?.name || user?.email || 'User'}</p><p className="mt-1 truncate text-xs text-muted">{user?.email}</p></div>
      <button onClick={() => handleNav('/dashboard')} className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F3F1EB] dark:hover:bg-white/5">Dashboard</button>
      <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm text-[#6B1E2E] transition-colors hover:bg-[#F9F1F2] dark:text-[#D79AA7] dark:hover:bg-white/5">Logout</button>
    </div>}
  </div>;
};

export default UserDropdown;
