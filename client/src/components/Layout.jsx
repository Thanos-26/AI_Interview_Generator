import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Optional Footer */}
      <footer className="w-full border-t border-rule py-6 text-center text-xs text-muted dark:border-white/10">
        &copy; 2026 Interview Sim
      </footer>
    </div>
  );
};

export default Layout;
