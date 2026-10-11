import { describe, it, expect, afterEach } from 'vitest';
import http from 'node:http';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import fxService, {
  FxService,
  FxUnavailableError,
  defaultFetcher,
} from '../../services/fxService.js';

// 起一个本地"上游汇率源"，用于验证 FX_UPSTREAM_URL 真实被读取
const startUpstream = (status, body) =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

describe('FxService 快照语义 (FX-R-001)', () => {
  it('从未成功获取时 getSnapshot 抛 FxUnavailableError (FX-S-003)', () => {
    const svc = new FxService({ fetcher: async () => { throw new Error('down'); } });
    expect(() => svc.getSnapshot()).toThrow(FxUnavailableError);
  });

  it('成功抓取后写入 lastSuccessSnapshot，state=available (FX-S-001)', async () => {
    const svc = new FxService({ fetcher: async () => 7.18 });
    await svc.refresh();
    const snap = svc.getSnapshot();
    expect(snap.rate).toBe(7.18);
    expect(snap.state).toBe('available');
  });

  it('抓取失败但存在历史快照时保留最新可用值（降级不清空, FX-S-002）', async () => {
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

  it('上游刚失败时立即标记 state=stale，而不是等快照过期 (FX-S-002)', async () => {
    let ok = true;
    const svc = new FxService({
      fetcher: async () => {
        if (ok) return 7.2;
        throw new Error('down');
      },
    });
    await svc.refresh();
    ok = false;
    await svc.refresh();
    expect(svc.getSnapshot().state).toBe('stale');
  });

  it('上游恢复后 state 回到 available (FX-S-001)', async () => {
    let ok = false;
    const svc = new FxService({
      fetcher: async () => {
        if (ok) return 7.3;
        throw new Error('down');
      },
    });
    svc.lastSuccessSnapshot = { rate: 7.2, fetchedAt: new Date().toISOString() };
    await svc.refresh();
    expect(svc.getSnapshot().state).toBe('stale');
    ok = true;
    await svc.refresh();
    expect(svc.getSnapshot()).toMatchObject({ rate: 7.3, state: 'available' });
  });

  it('startAutoRefresh 启动即完成首次刷新，接口立即可用（v1.1 修复：此前从未接线）', async () => {
    const svc = new FxService({ fetcher: async () => 7.21 });
    await svc.startAutoRefresh(60_000);
    expect(svc.getSnapshot().rate).toBe(7.21);
    svc.stopAutoRefresh();
    expect(svc.timer).toBeNull();
  });
});

describe('defaultFetcher 上游配置 (FX_UPSTREAM_URL / FX_FIXED_RATE)', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env.FX_UPSTREAM_URL = saved.FX_UPSTREAM_URL ?? '';
    process.env.FX_FIXED_RATE = saved.FX_FIXED_RATE ?? '';
  });

  it('配置 FX_UPSTREAM_URL 时从上游 JSON 读取 rate', async () => {
    const server = await startUpstream(200, { rate: 7.1234 });
    process.env.FX_UPSTREAM_URL = `http://127.0.0.1:${server.address().port}/`;
    try {
      expect(await defaultFetcher()).toBe(7.1234);
    } finally {
      server.close();
    }
  });

  it('兼容 { rates: { CNY } } 形态的上游响应', async () => {
    const server = await startUpstream(200, { base: 'USD', rates: { CNY: 7.05 } });
    process.env.FX_UPSTREAM_URL = `http://127.0.0.1:${server.address().port}/`;
    try {
      expect(await defaultFetcher()).toBe(7.05);
    } finally {
      server.close();
    }
  });

  it('上游返回 HTTP 错误时抛错（由 refresh 转为降级）', async () => {
    const server = await startUpstream(502, { error: 'bad gateway' });
    process.env.FX_UPSTREAM_URL = `http://127.0.0.1:${server.address().port}/`;
    try {
      await expect(defaultFetcher()).rejects.toThrow(/502/);
    } finally {
      server.close();
    }
  });

  it('未配置上游时使用 FX_FIXED_RATE，再缺省为内置 7.25', async () => {
    process.env.FX_UPSTREAM_URL = '';
    process.env.FX_FIXED_RATE = '7.3';
    expect(await defaultFetcher()).toBe(7.3);
    process.env.FX_FIXED_RATE = '';
    expect(await defaultFetcher()).toBe(7.25);
  });
});

describe('GET /api/fx/usd-cny 契约', () => {
  afterEach(() => {
    fxService.lastError = null;
  });

  it('无快照时返回 503 + messageKey fx.unavailable (FX-S-003)', async () => {
    fxService.lastSuccessSnapshot = null;
    const res = await request(app).get('/api/fx/usd-cny');
    expect(res.status).toBe(503);
    expect(res.body.messageKey).toBe('fx.unavailable');
  });

  it('有快照时返回 200 与 rate, state=available (FX-S-001)', async () => {
    fxService.lastSuccessSnapshot = {
      rate: 7.25,
      fetchedAt: new Date().toISOString(),
    };
    const res = await request(app).get('/api/fx/usd-cny');
    expect(res.status).toBe(200);
    expect(res.body.rate).toBe(7.25);
    expect(res.body.state).toBe('available');
    expect(res.body.fetchedAt).toBeTruthy();
  });

  it('上游失败但有快照时返回 200 + state=stale (FX-S-002)', async () => {
    fxService.lastSuccessSnapshot = {
      rate: 7.25,
      fetchedAt: new Date().toISOString(),
    };
    fxService.lastError = new Error('upstream down');
    const res = await request(app).get('/api/fx/usd-cny');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ rate: 7.25, state: 'stale' });
  });
});
