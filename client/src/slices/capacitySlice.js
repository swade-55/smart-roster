import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_PREFIX = '/labinv/api';

export const fetchDailyCapacity = createAsyncThunk(
  'capacity/fetchDailyCapacity',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/daily_capacity?start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setDailyDemand = createAsyncThunk(
  'capacity/setDailyDemand',
  async ({ date, totalCases }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/daily_demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, total_cases: totalCases }),
      });
      if (!response.ok) throw new Error('Server error');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const capacitySlice = createSlice({
  name: 'capacity',
  initialState: {
    dailyCapacity: {},
    dailyDemand: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyCapacity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDailyCapacity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dailyCapacity = action.payload.capacity;
        state.dailyDemand = action.payload.demand;
      })
      .addCase(fetchDailyCapacity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(setDailyDemand.fulfilled, (state, action) => {
        const { date, total_cases } = action.meta.arg;
        state.dailyDemand[date] = total_cases;
      });
  },
});

export default capacitySlice.reducer;