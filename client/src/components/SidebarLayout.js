import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../slices/authSlice';
import Breadcrumbs from './Breadcrumbs';
import 'bootstrap/dist/css/bootstrap.min.css';

const SidebarLayout = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser())
      .then(() => {
        navigate('/login');
      })
      .catch((error) => console.error('Logout failed', error));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-forest-800 text-forest-50 h-full fixed p-0 m-0 overflow-auto">
        <div className="p-4 text-2xl font-bold">
          <img src={`${process.env.PUBLIC_URL}/lablogo.png`} alt="Lab Logo" className="w-1/2 h-auto" />
        </div>
        <nav>
          <ul className="list-none p-0 m-0">
            <li className="border-b border-forest-700">
              <div
                onClick={toggleDropdown}
                className="block p-3 text-forest-50 bg-none border-none w-full text-left cursor-pointer hover:bg-forest-700"
              >
                Roster/Summary
                <span className="float-right">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {isDropdownOpen && (
                <ul className="list-none p-0 m-0">
                  <li className="border-b border-forest-700">
                    <Link
                      to="/employee-container"
                      className="block p-3 text-forest-50 no-underline hover:bg-forest-700"
                    >
                      Roster
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="border-b border-forest-700">
              <Link
                to="/allocation"
                className="block p-3 text-forest-50 no-underline hover:bg-forest-700"
              >
                Head Allocation
              </Link>
            </li>
            <li className="border-b border-forest-700">
              <Link
                to="/schedule"
                className="block p-3 text-forest-50 no-underline hover:bg-forest-700"
              >
                Schedule Generator
              </Link>
            </li>
            {auth.user && auth.user.role === 'admin' && (
              <li className="border-b border-forest-700">
                <Link
                  to="/manage-users"
                  className="block p-3 text-forest-50 no-underline hover:bg-forest-700"
                >
                  Manage Users
                </Link>
              </li>
            )}
            <li className="border-b border-forest-700">
              <button
                onClick={handleLogout}
                className="block p-3 text-forest-50 no-underline w-full text-left bg-none border-none hover:bg-forest-700"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="ml-64 w-[calc(100%-16rem)]">
        <header className="bg-forest-50 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-forest-800">ScheduleSmart</h1>
            <div className="text-forest-600">Welcome {auth.user.username}!</div>
          </div>
        </header>
        <main className="p-4 bg-forest-100 min-h-[calc(100vh-8rem)]">
          <Breadcrumbs />
          <Outlet />
        </main>
        <footer className="bg-forest-50 p-4 text-center text-forest-600">
          <p>© 2024 ScheduleSmart</p>
        </footer>
      </div>
    </div>
  );
};

export default SidebarLayout;