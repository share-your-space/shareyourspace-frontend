import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-white">ShareYourSpace</span>
        {/* Placeholder for Nav Links / User Menu / Theme Toggle */}
        <div className="space-x-4">
          <a href="/login" className="text-gray-300 hover:text-blue-400">Login</a>
          <a href="/signup" className="text-gray-300 hover:text-blue-400">Sign Up</a>
          {/* Add Dark Mode Toggle Here Later */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 