'use client';

import React, { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="container mx-auto px-2 py-2 md:px-4 md:py-4 flex items-center justify-between">
      <div className="text-xl md:text-2xl font-bold text-gray-800">Bio D Scan</div>
      <nav className="flex flex-row space-x-2 md:space-x-6">
        <a href="/" className="text-yellow-500 hover:text-blue-500 font-extrabold cursor-pointer text-sm md:text-base px-1 md:px-0">Home</a>
        <a href="/dashboard" className="text-yellow-500 hover:text-blue-500 font-extrabold cursor-pointer text-sm md:text-base px-1 md:px-0">Dashboard</a>
      </nav>
      <button className="bg-yellow-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-md hover:bg-yellow-600 text-sm md:text-base">Contact Us</button>
    </div>
  );
};

export default Header;
