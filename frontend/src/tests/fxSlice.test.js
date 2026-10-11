import { describe, it, expect, beforeEach } from 'vitest';
import fxReducer, {
  fxSnapshotReceived,
  fxFetchFailed,
} from '../slices/fxSlice.js';

describe('fxSlice 快照降级语义 (FX-R-002)', () => {
  beforeEach(() => localStorage.clear());

  it('初始为 loading：首次请求返回前不判定为不可用，避免横幅闪烁 (FX-S-004)', () => {
    const state = fxReducer(undefined, { type: '@@INIT' });
    expect(state.state).toBe('loading');
  });

  it('收到快照 => available 并写入 localStorage fx_cmd_cny_snapshot (FX-S-001)', () => {
    const state = fxReducer(
      undefined,
      fxSnapshotReceived({ rate: 7.2, fetchedAt: '2026-07-12T00:00:00Z', state: 'available' })
    );
    expect(state.state).toBe('available');
    expect(state.snapshot.rate).toBe(7.2);
    expect(JSON.parse(localStorage.getItem('fx_cmd_cny_snapshot')).rate).toBe(7.2);
  });

  it('后端返回 state=stale => 前端进入 stale 并保留快照 (FX-S-002/004)', () => {
    const state = fxReducer(
      undefined,
      fxSnapshotReceived({ rate: 7.2, fetchedAt: '2026-07-12T00:00:00Z', state: 'stale' })
    );
    expect(state.state).toBe('stale');
    expect(state.snapshot.rate).toBe(7.2);
  });

  it('请求失败但有历史快照 => stale 且保留快照（不清空, FX-S-004）', () => {
    let state = fxReducer(
      undefined,
      fxSnapshotReceived({ rate: 7.2, fetchedAt: '2026-07-12T00:00:00Z' })
    );
    state = fxReducer(state, fxFetchFailed());
    expect(state.state).toBe('stale');
    expect(state.snapshot.rate).toBe(7.2);
  });

  it('请求失败且无历史快照 => unavailable (FX-S-005)', () => {
    const state = fxReducer(
      { snapshot: null, state: 'loading', availableRate: false },
      fxFetchFailed()
    );
    expect(state.state).toBe('unavailable');
    expect(state.availableRate).toBe(false);
  });
});
