import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  tools: [],
  categories: [],
  testlines: [],
  reservations: [],
  status: 'idle',
  error: null,
};

const API_PREFIX = '/labinv/api';

// Async thunk action for adding a test line
export const addTestLine = createAsyncThunk(
  'testlines/addTestLine',
  async (testlineData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/add_testline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testlineData),
      });

      if (!response.ok) throw new Error('Server error!');
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error in addTestLine thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch testlines
export const fetchTestLines = createAsyncThunk(
  'testlines/fetchTestLines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/testlines`);
      if (!response.ok) throw new Error('Server error!');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchTestLines thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk actions for reservations
export const reserveTestLine = createAsyncThunk(
  'tools/reserveTestLine',
  async ({ user_id, testline_id }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/reserve_testline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, testline_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reserve testline');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const returnTestLine = createAsyncThunk(
  'tools/returnTestLine',
  async ({ user_id, testline_id }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/return_testline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, testline_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to return testline');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTool = createAsyncThunk(
  'tools/addTool',
  async (toolData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/add_tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
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


export const deleteTool = createAsyncThunk(
  'tools/deleteTool',
  async (toolId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/tool_metrics/${toolId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return toolId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTools = createAsyncThunk('tools/fetchTools', async () => {
  const url = `${API_PREFIX}/tools_details`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    throw new Error('Could not fetch tools');
  }

  const data = await response.json();
  return data;
});

export const updateTool = createAsyncThunk(
  'tools/updateTool',
  async (toolData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/update_tool/${toolData.toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });

      if (!response.ok) {
        throw new Error('Server error!');
      }

      const updatedTool = await response.json();
      return updatedTool;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Category Async Thunks
export const addCategory = createAsyncThunk(
  'data/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/add_category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) throw new Error('Server error!');
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error in addCategory thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'data/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Network response was not ok');
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'data/updateCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/categories/${categoryData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) throw new Error('Server error!');
      const updatedCategory = await response.json();
      return updatedCategory;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk('data/fetchCategories', async () => {
  const response = await fetch(`${API_PREFIX}/get_categories`);
  if (!response.ok) {
    throw new Error('Could not fetch categories');
  }
  const data = await response.json();
  return data;
});

export const exportTools = createAsyncThunk(
  'tools/exportTools',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/export/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tools_export.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importTools = createAsyncThunk(
  'tools/importTools',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_PREFIX}/import/tools`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import tools');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const toolSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTool.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tools.push(action.payload);
        state.error = null; // Clear any previous error
      })
      .addCase(addTool.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tools = action.payload;
      })
      .addCase(deleteTool.fulfilled, (state, action) => {
        state.tools = state.tools.filter((tool) => tool.id !== action.payload);
      })
      .addCase(updateTool.rejected, (state, action) => {
        console.error('Failed to update tool:', action.payload);
      })
      .addCase(updateTool.fulfilled, (state, action) => {
        const index = state.tools.findIndex((tool) => tool.id === action.payload.id);
        if (index !== -1) {
          state.tools[index] = action.payload;
        } else {
          console.warn('Updated tool not found in the array');
        }
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((category) => category.id !== action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((category) => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(exportTools.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(importTools.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tools = [...state.tools, ...action.payload]; // action.payload should be an array
      })
      .addCase(importTools.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(reserveTestLine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const testline = state.testlines.find((t) => t.id === action.payload.testline.id);
        if (testline) {
          Object.assign(testline, action.payload.testline);
        }
      })
      .addCase(returnTestLine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const testline = state.testlines.find(t => t.id === action.payload.testline.id);
        if (testline) {
          Object.assign(testline, action.payload.testline);
        }
      })
      .addCase(addTestLine.fulfilled, (state, action) => {
        state.testlines.push(action.payload);
      })
      .addCase(fetchTestLines.fulfilled, (state, action) => {
        state.testlines = action.payload;
      })
      ;
  },
});

export const { clearError } = toolSlice.actions;

export default toolSlice.reducer;

