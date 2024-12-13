import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      title: "Smart Schedule Generation",
      description: "Automatically create optimal 4-day or 5-day work schedules with consecutive rest days",
      icon: "📅"
    },
    {
      title: "Staff Management",
      description: "Efficiently manage staffing requirements across different days of the week",
      icon: "👥"
    },
    {
      title: "Coverage Analysis",
      description: "Detailed analytics on staffing coverage, variances, and efficiency metrics",
      icon: "📊"
    },
    {
      title: "Pattern Optimization",
      description: "Generate work patterns that minimize total staff while meeting all requirements",
      icon: "⚡"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <nav className="bg-slate-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={`${process.env.PUBLIC_URL}/lablogo.png`} 
                alt="ScheduleSmart Logo" 
                className="h-8 md:h-12"
              />
              <span className="text-lg md:text-2xl font-bold">ScheduleSmart</span>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-4">
              <Link to="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg transition-colors">
                  Log In
                </button>
              </Link>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <Link to="/login">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-lg transition-colors">
                  Log In
                </button>
              </Link>
              <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-lg transition-colors"
              >
                Learn More
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Intelligent Workforce Scheduling
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-300 px-4">
            Optimize your workforce scheduling with AI-powered solutions that ensure 
            coverage while maximizing employee satisfaction
          </p>
          <div className="flex justify-center">
            <Link to="/schedule">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg text-lg font-semibold transition-colors">
                Try Demo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto py-12 md:py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{feature.icon}</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl md:text-2xl font-bold mb-4">How to Use ScheduleSmart</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-1 md:mb-2">1. Enter Staffing Requirements</h4>
                <p className="text-gray-600 text-sm md:text-base">Input your daily staffing needs for each day of the week</p>
              </div>
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-1 md:mb-2">2. Choose Schedule Type</h4>
                <p className="text-gray-600 text-sm md:text-base">Select between 4-day or 5-day work patterns</p>
              </div>
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-1 md:mb-2">3. Generate & Review</h4>
                <p className="text-gray-600 text-sm md:text-base">Get optimized schedules with detailed analytics and coverage analysis</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="mt-4 md:mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-6 md:py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm md:text-base">&copy; 2024 ScheduleSmart Roster Management. All rights reserved.</p>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            Contact support: help@schedulesmart.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;