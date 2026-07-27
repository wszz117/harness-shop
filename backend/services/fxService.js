// fxService —— USD/CNY 汇率服务
// 核心不变量：lastSuccessSnapshot 只在成功抓取后写入并保留最新可用快照；
// 从未成功获取时快照为 null，对外抛 FxUnavailableError (503)。

export class FxUnavailableError extends Error {
  constructor(message = 'FX rate completely unavailable') {
    super(message);
    this.name = 'FxUnavailableError';
  }
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const STALE_AFTER_MS = 30 * 60 * 1000;

class FxService {
  constructor({ fetcher } = {}) {
    this.fetcher = fetcher || defaultFetcher;
    this.lastSuccessSnapshot = null; // { rate, fetchedAt }
    this.lastError = null;
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
    return {
      ...this.lastSuccessSnapshot,
      state: ageMs > STALE_AFTER_MS ? 'stale' : 'available',
    };
  }

  startAutoRefresh() {
    this.refresh().catch(() => {});
    this.timer = setInterval(() => this.refresh().catch(() => {}), REFRESH_INTERVAL_MS);
    if (this.timer.unref) this.timer.unref();
  }
}

async function defaultFetcher() {
  // 离线/本地环境使用固定演示汇率；生产可替换为真实行情源
  if (process.env.FX_FIXED_RATE) return Number(process.env.FX_FIXED_RATE);
  return 7.25;
}

const fxService = new FxService();
export { FxService };
export default fxService;
