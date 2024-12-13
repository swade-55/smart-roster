import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (scheduleParams, { rejectWithValue }) => {
    try {
      const payload = {
        required_heads: scheduleParams.required_heads.slice(0, 6),
        schedule_type: scheduleParams.schedule_type
      };
      console.log('Sending API request with payload:', payload);

      const response = await fetch('/labinv/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)  // Just use the payload we created
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
      
      return responseData.data;
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