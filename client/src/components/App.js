import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { checkSession } from '../slices/authSlice';
import LandingPage from './LandingPage';
import LoginForm from './LoginForm';
import NewUserForm from './NewUserForm';
import SidebarLayout from './SidebarLayout';
import MasterOperatingPlan from './MasterOperatingPlan';
import ManageUsers from './ManageUsers'; // Import ManageUsers
import EmployeeContainer from './EmployeeContainer';
import AllocationSummary from './AllocationSummary';
import ScheduleForm from './ScheduleForm';
import CapacityDashboard from './CapacityDashboard';
import ProtectedRoute from './ProtectedRoute';
import SubscriptionPage from './SubscriptionPage';
import SuccessPage from './SuccessPage'
// import dotenv from 'dotenv';
// dotenv.config();


function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession()).then((action) => {
      if (action.type.endsWith('fulfilled')) {
        
      }
    });
  }, [dispatch]);

  return (
    <Router basename="/labinv">
      <Routes>
        {!auth.isAuthenticated ? (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<NewUserForm />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </>
        ) : (
          <Route path="/" element={<SidebarLayout />}>
            <Route path="masteroperatingplan" element={<MasterOperatingPlan />} />
            {auth.user && auth.user.role === 'admin' && (
              <Route path="manage-users" element={<ManageUsers />} />
            )}
            <Route path="/employee-container" element={<MasterOperatingPlan />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription-success" element={<SuccessPage />} />
            <Route 
              path="/allocation" 
              element={
                <ProtectedRoute>
                  <AllocationSummary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute>
                  <ScheduleForm />
                </ProtectedRoute>
              } 
            />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;