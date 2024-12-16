import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (scheduleParams, { rejectWithValue }) => {
    try {
      const payload = {
        required_heads: scheduleParams.required_heads,
        schedule_type: scheduleParams.schedule_type,
        package_type: scheduleParams.package_type
      };
      console.log('Sending API request with payload:', payload);

      const response = await fetch('/labinv/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const responseData = await response.json();
      console.log('API response:', responseData);
      
      if (responseData.status === 'error') {
        throw new Error(responseData.error);
      }
      
      // Transform the data to match frontend expectations
      const transformedData = {
        schedule: responseData.data.schedule,
        daily_totals: {},
        daily_requirements: {},
        variances: {},
        staffing_analysis: {
          variance_summary: {
            total_over_staffed: 0,
            total_under_staffed: 0,
            days_exactly_staffed: 0
          }
        },
        total_staff_needed: 0,
        package_type: scheduleParams.package_type
      };

      // Calculate daily totals and variances
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Initialize total staff counter
      let totalStaff = 0;
      
      // Calculate pattern totals first
      Object.values(responseData.data.schedule).forEach(pattern => {
        const patternStaff = Math.max(...Object.values(pattern));
        totalStaff += patternStaff;
      });
      
      transformedData.total_staff_needed = totalStaff;

      days.forEach((day, index) => {
        let total = 0;
        Object.values(responseData.data.schedule).forEach(pattern => {
          total += pattern[day] || 0;
        });
        
        transformedData.daily_totals[day] = total;
        transformedData.daily_requirements[day] = scheduleParams.required_heads[index];
        transformedData.variances[day] = total - scheduleParams.required_heads[index];

        if (transformedData.variances[day] > 0) {
          transformedData.staffing_analysis.variance_summary.total_over_staffed += 
            transformedData.variances[day];
        } else if (transformedData.variances[day] < 0) {
          transformedData.staffing_analysis.variance_summary.total_under_staffed += 
            Math.abs(transformedData.variances[day]);
        } else {
          transformedData.staffing_analysis.variance_summary.days_exactly_staffed += 1;
        }
      });

      return transformedData;
    } catch (error) {
      console.error('Error in fetchSchedule:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  scheduleData: null,
  status: 'idle',
  error: null
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearSchedule: (state) => {
      state.scheduleData = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        console.log('Schedule fetch pending');
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        console.log('Schedule fetch fulfilled:', action.payload);
        state.status = 'succeeded';
        state.scheduleData = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        console.log('Schedule fetch rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;