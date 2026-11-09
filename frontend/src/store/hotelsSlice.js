import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchHotelsApi,
  fetchHotelApi,
  createHotelApi,
  updateHotelApi,
  deleteHotelApi,
} from '../api/hotelApi';

export const PAGE_SIZE = 6;

const serializeError = (err) => ({ message: err.message, errors: err.errors || {} });

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { search, minPrice, maxPrice, page } = getState().hotels.filters;
    try {
      return await fetchHotelsApi({
        search,
        minPrice,
        maxPrice,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

export const fetchHotel = createAsyncThunk('hotels/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await fetchHotelApi(id);
  } catch (err) {
    return rejectWithValue(serializeError(err));
  }
});

export const saveHotel = createAsyncThunk(
  'hotels/save',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return id ? await updateHotelApi(id, formData) : await createHotelApi(formData);
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

export const deleteHotel = createAsyncThunk('hotels/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteHotelApi(id);
    return id;
  } catch (err) {
    return rejectWithValue(serializeError(err));
  }
});

const initialState = {
  items: [],
  total: 0,
  current: null,
  filters: { search: '', minPrice: '', maxPrice: '', page: 1 },
  loading: false,
  saving: false,
  error: null,
  saveErrors: {},
  deleteSuccess: false,
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    clearSaveErrors(state) {
      state.saveErrors = {};
    },
    clearCurrent(state) {
      state.current = null;
      state.error = null;
    },
    dismissDeleteSuccess(state) {
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchHotels.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.data;
        s.total = a.payload.total;
      })
      .addCase(fetchHotels.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || 'Failed to load hotels';
      })
      .addCase(fetchHotel.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchHotel.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchHotel.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || 'Failed to load hotel';
      })
      .addCase(saveHotel.pending, (s) => {
        s.saving = true;
        s.saveErrors = {};
      })
      .addCase(saveHotel.fulfilled, (s) => {
        s.saving = false;
      })
      .addCase(saveHotel.rejected, (s, a) => {
        s.saving = false;
        s.saveErrors = { ...(a.payload?.errors || {}), _form: a.payload?.message };
      })
      .addCase(deleteHotel.fulfilled, (s, a) => {
        s.items = s.items.filter((h) => h.id !== a.payload);
        s.total = Math.max(0, s.total - 1);
        s.deleteSuccess = true;
      })
      .addCase(deleteHotel.rejected, (s, a) => {
        s.error = a.payload?.message || 'Failed to delete hotel';
      });
  },
});

export const { setFilters, setPage, clearFilters, clearSaveErrors, clearCurrent, dismissDeleteSuccess } =
  hotelsSlice.actions;
export default hotelsSlice.reducer;
