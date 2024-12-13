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
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-forest-800 z-50 px-4 py-2 flex items-center justify-between">
        <button onClick={toggleSidebar} className="text-white p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="text-white text-lg font-bold">ScheduleSmart</div>
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
        fixed lg:static w-64 h-full bg-forest-800 text-forest-50 z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <img src="/labinv/lablogo.png" alt="Lab Logo" className="w-1/2 h-auto mb-4" />
        </div>
        
        <nav className="space-y-1">
          <div className="border-b border-forest-700">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between w-full p-3 text-forest-50 hover:bg-forest-700"
            >
              <span>Roster/Summary</span>
              {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isDropdownOpen && (
              <Link
                to="/employee-container"
                className="block p-3 pl-6 text-forest-50 hover:bg-forest-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                Roster
              </Link>
            )}
          </div>

          <Link
            to="/allocation"
            className="block p-3 text-forest-50 hover:bg-forest-700 border-b border-forest-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            Head Allocation
          </Link>

          <Link
            to="/schedule"
            className="block p-3 text-forest-50 hover:bg-forest-700 border-b border-forest-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            Schedule Generator
          </Link>

          {auth.user?.role === 'admin' && (
            <Link
              to="/manage-users"
              className="block p-3 text-forest-50 hover:bg-forest-700 border-b border-forest-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              Manage Users
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left p-3 text-forest-50 hover:bg-forest-700 border-b border-forest-700"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-forest-50 p-4 shadow-md mt-14 lg:mt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl lg:text-2xl font-bold text-forest-800">ScheduleSmart</h1>
            <div className="text-forest-600">Welcome {auth.user?.username}!</div>
          </div>
        </header>

        <main className="flex-1 p-4 bg-forest-100 overflow-auto">
          <Breadcrumbs />
          <Outlet />
        </main>

        <footer className="bg-forest-50 p-4 text-center text-forest-600 shadow-inner">
          <p>© 2024 ScheduleSmart</p>
        </footer>
      </div>
    </div>
  );
};

export default SidebarLayout;
