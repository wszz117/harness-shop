import { describe, it, expect } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import fxService, { FxService, FxUnavailableError } from '../../services/fxService.js';

describe('FxService 快照语义 (FX-R-001)', () => {
  it('从未成功获取时 getSnapshot 抛 FxUnavailableError (S-002)', () => {
    const svc = new FxService({ fetcher: async () => { throw new Error('down'); } });
    expect(() => svc.getSnapshot()).toThrow(FxUnavailableError);
  });

  it('成功抓取后写入 lastSuccessSnapshot (S-001)', async () => {
    const svc = new FxService({ fetcher: async () => 7.18 });
    await svc.refresh();
    const snap = svc.getSnapshot();
    expect(snap.rate).toBe(7.18);
    expect(snap.state).toBe('available');
  });

  it('抓取失败但存在历史快照时保留最新可用值（降级不清空, S-005）', async () => {
    let ok = true;
    const svc = new FxService({
      fetcher: async () => {
        if (ok) return 7.2;
        throw new Error('down');
      },
    });
    await svc.refresh();
    ok = false;
    await svc.refresh(); // 失败但不抛，因为有历史快照
    expect(svc.getSnapshot().rate).toBe(7.2);
  });
});

describe('GET /api/fx/usd-cny 契约', () => {
  it('无快照时返回 503 + messageKey fx.unavailable (S-002)', async () => {
    fxService.lastSuccessSnapshot = null;
    const res = await request(app).get('/api/fx/usd-cny');
    expect(res.status).toBe(503);
    expect(res.body.messageKey).toBe('fx.unavailable');
  });

  it('有快照时返回 200 与 rate (S-001)', async () => {
    fxService.lastSuccessSnapshot = {
      rate: 7.25,
      fetchedAt: new Date().toISOString(),
    };
    const res = await request(app).get('/api/fx/usd-cny');
    expect(res.status).toBe(200);
    expect(res.body.rate).toBe(7.25);
    expect(res.body.state).toBe('available');
  });
});
