import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (dailyDemand, { rejectWithValue }) => {
    try {
      const payload = {
        required_heads: dailyDemand
      };

      const response = await fetch('/labinv/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
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
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.scheduleData = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;