import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice.js';

// FX 快照兜底：localStorage 键 fx_cmd_cny_snapshot
// 状态语义：available | stale | unavailable (design: exchange-rate-cache-fallback)
const SNAPSHOT_KEY = 'fx_cmd_cny_snapshot';

const readLocalSnapshot = () => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  snapshot: readLocalSnapshot(), // { rate, fetchedAt }
  state: readLocalSnapshot() ? 'stale' : 'unavailable',
  availableRate: Boolean(readLocalSnapshot()),
};

const fxSlice = createSlice({
  name: 'fx',
  initialState,
  reducers: {
    fxSnapshotReceived: (state, action) => {
      state.snapshot = {
        rate: action.payload.rate,
        fetchedAt: action.payload.fetchedAt,
      };
      state.state = action.payload.state || 'available';
      state.availableRate = true;
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(state.snapshot));
    },
    fxFetchFailed: (state) => {
      // 失败不清空历史快照，仅降级为 stale / unavailable
      state.state = state.snapshot ? 'stale' : 'unavailable';
      state.availableRate = Boolean(state.snapshot);
    },
  },
});

export const { fxSnapshotReceived, fxFetchFailed } = fxSlice.actions;

// selectors
export const selectFxSnapshot = (state) => state.fx.snapshot;
export const selectFxState = (state) => state.fx.state;
export const selectFxSnapshotForConversion = (state) =>
  state.fx.snapshot ? state.fx.snapshot.rate : null;
export const selectIsFxCompletelyUnavailable = (state) =>
  state.fx.state === 'unavailable';

export default fxSlice.reducer;

// RTK Query 端点：focus/online 自动重取
export const fxApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsdCny: builder.query({
      query: () => ({ url: '/api/fx/usd-cny' }),
      keepUnusedDataFor: 60,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(fxSnapshotReceived(data));
        } catch {
          dispatch(fxFetchFailed());
        }
      },
    }),
  }),
});

export const { useGetUsdCnyQuery } = fxApiSlice;
