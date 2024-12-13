import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../slices/authSlice';
import Breadcrumbs from './Breadcrumbs';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

const SidebarLayout = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser())
      .then(() => navigate('/login'))
      .catch((error) => console.error('Logout failed', error));
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-800 z-50 px-4 py-3 flex items-center justify-between shadow-lg">
        <button onClick={toggleSidebar} className="text-slate-200 p-2 hover:bg-slate-700 rounded">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="text-slate-200 text-lg font-bold">ScheduleSmart</div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static w-64 h-full bg-slate-800 shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="bg-slate-900 p-6 border-b border-slate-700">
          <img src="/labinv/lablogo.png" alt="Lab Logo" className="w-1/2 h-auto mb-2" />
          <h2 className="text-slate-200 font-semibold text-lg">ScheduleSmart</h2>
        </div>
        
        <nav className="py-4">
          {/* Dropdown Section */}
          <div className="mb-2">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between w-full px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-3">📊</span>
                <span>Roster/Summary</span>
              </span>
              {isDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isDropdownOpen && (
              <Link
                to="/employee-container"
                className="block px-4 py-3 pl-12 text-slate-300 hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
                onClick={() => setIsSidebarOpen(false)}
              >
                Roster
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <Link
            to="/allocation"
            className="flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="mr-3">📈</span>
            <span>Head Allocation</span>
          </Link>

          <Link
            to="/schedule"
            className="flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="mr-3">📅</span>
            <span>Schedule Generator</span>
          </Link>

          {auth.user?.role === 'admin' && (
            <Link
              to="/manage-users"
              className="flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">👥</span>
              <span>Manage Users</span>
            </Link>
          )}

          {/* Logout Section */}
          <div className="mt-4 px-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-slate-200 hover:bg-red-600 transition-colors rounded"
            >
              <span className="mr-3">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white p-4 shadow-md mt-14 lg:mt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">ScheduleSmart</h1>
            <div className="text-slate-600">Welcome {auth.user?.username}!</div>
          </div>
        </header>

        <main className="flex-1 p-4 bg-slate-50 overflow-auto">
          <Breadcrumbs />
          <Outlet />
        </main>

        <footer className="bg-white p-4 text-center text-slate-600 shadow-inner">
          <p>© 2024 ScheduleSmart</p>
        </footer>
      </div>
    </div>
  );
};

export default SidebarLayout;