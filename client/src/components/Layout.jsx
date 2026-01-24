import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Optional Footer */}
      <footer className="w-full py-8 text-center text-gray-500 text-xs border-t border-white/5">
        &copy; 2026 INTERVIEW.AI - Build with Career Logic.
      </footer>
    </div>
  );
};

export default Layout;