import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_PREFIX = '/labinv/api';

const initialState = {
  employees: [],
  status: 'idle',
  error: null,
};

export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async () => {
  const response = await fetch(`${API_PREFIX}/employees`);
  if (!response.ok) {
    throw new Error('Could not fetch employees');
  }
  const data = await response.json();
  return data;
});
export const updateEmployeeSchedule = createAsyncThunk(
    'employees/updateEmployeeSchedule',
    async ({ employeeId, scheduleData }, { rejectWithValue }) => {
      try {
        const response = await fetch(`${API_PREFIX}/update_employee_schedule/${employeeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData),
        });
  
        if (!response.ok) {
          throw new Error('Server error!');
        }
  
        const updatedSchedule = await response.json();
        return { employeeId, schedule: updatedSchedule.schedule };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
export const addEmployee = createAsyncThunk(
  'employees/addEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/add_employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error!');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/update_employee/${employeeData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error('Server error!');
      }

      const updatedEmployee = await response.json();
      return updatedEmployee;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/employees/${employeeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return employeeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex((employee) => employee.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((employee) => employee.id !== action.payload);
      })
      .addCase(updateEmployeeSchedule.fulfilled, (state, action) => {
        const index = state.employees.findIndex((employee) => employee.id === action.payload.employeeId);
        if (index !== -1) {
          state.employees[index].schedule = action.payload.schedule;
        }
      });
  },
});

export const { clearError } = employeeSlice.actions;

export default employeeSlice.reducer;