import React from 'react';

const Header = () => {
    return (
        // Make header absolutely positioned and above the hero
        <header className="absolute top-0 left-0 w-full bg-transparent z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo or Brand Name */}
                <div className="text-2xl font-bold text-gray-800">Bio D Scan</div>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-6">
                    <a href="/" className="text-white hover:text-yellow-500 font-extrabold cursor-pointer">
                        Home
                    </a>
                    <a href="/dashboard" className="text-white hover:text-yellow-500 font-extrabold cursor-pointer">
                        Dashboard
                    </a>
                </nav>

                {/* Contact Button */}
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Contact Us</button>
            </div>
        </header>
    );
};

export default Header;
