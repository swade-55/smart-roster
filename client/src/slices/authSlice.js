import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_PREFIX = '/labinv/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, {rejectWithValue})=>{
    try {
      const response = await fetch(`${API_PREFIX}/forgot-password`, {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify({email})
      });

      if (!response.ok) throw new Error('Failed to process request');
      return await response.json();
    } catch(error){
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({token,password}, {rejectWithValue})=>{
    try {
      const response=await fetch(`${API_PREFIX}/reset-password/${token}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({password})
      });

      if (!response.ok) throw new Error('failed to reset password');
      return await response.json();
    } catch (error){
      return rejectWithValue(error.message);
    }
  }
);

export const checkSession = createAsyncThunk('auth/checkSession', async (_, thunkAPI) => {
  try {
    const response = await fetch(`${API_PREFIX}/check_session`, { credentials: 'include' });
    const data = await response.json();
    if (response.ok && data.isAuthenticated) {
      return { 
        isAuthenticated: true, 
        user: data.user,
        hasSubscription: data.user.has_subscription // Add this line
      };
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, thunkAPI) => {
  try {
    await fetch(`${API_PREFIX}/logout`, { method: 'POST', credentials: 'include' });
    return { isAuthenticated: false };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/users`);
      if (!response.ok) throw new Error('Server error!');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchUsers thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addUser = createAsyncThunk(
  'auth/addUser',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const adminId = state.auth.user.id;  // Assuming the logged-in user is the admin

      const response = await fetch(`${API_PREFIX}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, admin_id: adminId }),
      });
      if (!response.ok) throw new Error('Server error!');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in addUser thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_id: 1 }), // Replace with dynamic admin_id
      });
      if (!response.ok) throw new Error('Server error!');
      return userId;
    } catch (error) {
      console.error('Error in deleteUser thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'auth/updateSubscription',
  async (subscriptionStatus, { rejectWithValue }) => {
    try {
      const response = await fetch('/labinv/api/update-subscription', {
        method: 'POST',
        body: JSON.stringify({ hasSubscription: subscriptionStatus }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update subscription');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  hasSubscription: false,
  isLoading: false,
  error: null,
  users: [], // Ensure users is initialized as an array
  userStatus: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.hasSubscription = action.payload.user.has_subscription; // Add this line
      state.isLoading = false;
      state.error = null;
    })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.hasSubscription = action.payload.hasSubscription; // Add this line
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.users.push(action.payload);
      })
      .addCase(addUser.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(addUser.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        console.log('updateSubscription fulfilled:', action.payload);
        state.hasSubscription = action.payload.hasSubscription;
        if (state.user) {
          state.user.has_subscription = action.payload.hasSubscription;
        }
      })
      .addCase(forgotPassword.fulfilled, (state)=>{
        state.error=null;
      })
      .addCase(resetPassword.fulfilled, (state)=>{
        state.error=null;
      });
  },
});

export default authSlice.reducer;
