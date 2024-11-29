import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice'
import employeeReducer from '../slices/employeeSlice'
import allocationReducer from '../slices/allocationSlice';
import scheduleReducer from '../slices/scheduleSlice';
import capacityReducer from '../slices/capacitySlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    allocation: allocationReducer,
    schedule: scheduleReducer,
    capacity: capacityReducer
  },
});

export default store;