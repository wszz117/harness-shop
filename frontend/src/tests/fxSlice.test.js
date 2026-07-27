import { describe, it, expect, beforeEach } from 'vitest';
import fxReducer, {
  fxSnapshotReceived,
  fxFetchFailed,
} from '../slices/fxSlice.js';

describe('fxSlice 快照降级语义 (FX-R-001)', () => {
  beforeEach(() => localStorage.clear());

  it('初始无快照 => unavailable', () => {
    const state = fxReducer(undefined, { type: '@@INIT' });
    expect(state.state).toBe('unavailable');
    expect(state.availableRate).toBe(false);
  });

  it('收到快照 => available 并写入 localStorage fx_cmd_cny_snapshot', () => {
    const state = fxReducer(
      undefined,
      fxSnapshotReceived({ rate: 7.2, fetchedAt: '2026-07-12T00:00:00Z' })
    );
    expect(state.state).toBe('available');
    expect(state.snapshot.rate).toBe(7.2);
    expect(JSON.parse(localStorage.getItem('fx_cmd_cny_snapshot')).rate).toBe(7.2);
  });

  it('失败但有历史快照 => stale 且保留快照（不清空）', () => {
    let state = fxReducer(
      undefined,
      fxSnapshotReceived({ rate: 7.2, fetchedAt: '2026-07-12T00:00:00Z' })
    );
    state = fxReducer(state, fxFetchFailed());
    expect(state.state).toBe('stale');
    expect(state.snapshot.rate).toBe(7.2);
  });

  it('失败且无历史快照 => unavailable', () => {
    const state = fxReducer(undefined, fxFetchFailed());
    expect(state.state).toBe('unavailable');
  });
});
