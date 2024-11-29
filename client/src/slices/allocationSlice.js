import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllocation = createAsyncThunk(
  'allocation/fetchAllocation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch('/labinv/api/allocate_heads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const allocationData = await response.json();
      return allocationData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const allocationSlice = createSlice({
  name: 'allocation',
  initialState: {
    allocationData: {},
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allocationData = action.payload;
      })
      .addCase(fetchAllocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default allocationSlice.reducer;
