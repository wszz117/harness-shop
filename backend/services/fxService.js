// fxService —— USD/CNY 汇率服务
// 核心不变量：lastSuccessSnapshot 只在成功抓取后写入并保留最新可用快照；
// 上游失败时不清空快照，对外标记 state=stale（降级）；
// 从未成功获取时快照为 null，对外抛 FxUnavailableError (503)。
// 契约：getSnapshot() → { rate, fetchedAt, state: 'available' | 'stale' }

export class FxUnavailableError extends Error {
  constructor(message = 'FX rate completely unavailable') {
    super(message);
    this.name = 'FxUnavailableError';
  }
}

const DEFAULT_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const STALE_AFTER_MS = 30 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 5000;

class FxService {
  constructor({ fetcher } = {}) {
    this.fetcher = fetcher || defaultFetcher;
    this.lastSuccessSnapshot = null; // { rate, fetchedAt }
    this.lastError = null;
    this.timer = null;
  }

  async refresh() {
    try {
      const rate = await this.fetcher();
      if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
        throw new Error(`invalid rate: ${rate}`);
      }
      this.lastSuccessSnapshot = { rate, fetchedAt: new Date().toISOString() };
      this.lastError = null;
      return this.lastSuccessSnapshot;
    } catch (err) {
      this.lastError = err;
      if (!this.lastSuccessSnapshot) {
        throw new FxUnavailableError();
      }
      return this.lastSuccessSnapshot; // 降级：返回最近一次成功快照 (stale)
    }
  }

  getSnapshot() {
    if (!this.lastSuccessSnapshot) {
      throw new FxUnavailableError();
    }
    const ageMs = Date.now() - Date.parse(this.lastSuccessSnapshot.fetchedAt);
    // 最近一次刷新失败，或快照超过 30 分钟未更新，都视为缓存汇率
    const stale = Boolean(this.lastError) || ageMs > STALE_AFTER_MS;
    return {
      ...this.lastSuccessSnapshot,
      state: stale ? 'stale' : 'available',
    };
  }

  // 启动即拉取一次并定时刷新；返回首次刷新的 Promise（失败不抛）
  startAutoRefresh(intervalMs = refreshIntervalFromEnv()) {
    this.stopAutoRefresh();
    const first = this.refresh().catch(() => null);
    this.timer = setInterval(() => this.refresh().catch(() => {}), intervalMs);
    if (this.timer.unref) this.timer.unref();
    return first;
  }

  stopAutoRefresh() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

function refreshIntervalFromEnv() {
  const ms = Number(process.env.FX_REFRESH_INTERVAL_MS);
  return Number.isFinite(ms) && ms >= 1000 ? ms : DEFAULT_REFRESH_INTERVAL_MS;
}

// 上游优先级：FX_UPSTREAM_URL（真实或模拟行情源）> FX_FIXED_RATE（固定演示汇率）> 内置 7.25
// 上游响应兼容 { rate } 与 { rates: { CNY } } 两种常见形态
export async function defaultFetcher() {
  const url = process.env.FX_UPSTREAM_URL;
  if (url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`FX upstream responded HTTP ${res.status}`);
    const body = await res.json();
    return Number(body?.rate ?? body?.rates?.CNY);
  }
  if (process.env.FX_FIXED_RATE) return Number(process.env.FX_FIXED_RATE);
  return 7.25;
}

const fxService = new FxService();
export { FxService };
export default fxService;
