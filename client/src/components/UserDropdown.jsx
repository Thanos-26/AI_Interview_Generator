import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userEmail } = useContext(AppContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-10 h-10 rounded-full border-2 border-purple-500/50 overflow-hidden bg-white/10 p-1 transition hover:scale-105"
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl py-2 border border-purple-500/20 z-[110] backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-gray-500/10 mb-2">
            <p className="text-[10px] font-bold uppercase text-purple-500">Candidate Mode</p>
            <p className="text-sm font-semibold truncate">{userEmail}</p>
          </div>
          <button 
            onClick={() => handleNav('/dashboard')} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-500/10 transition"
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleNav('/')} 
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 font-bold"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;