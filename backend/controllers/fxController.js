import asyncHandler from '../middleware/asyncHandler.js';
import fxService, { FxUnavailableError } from '../services/fxService.js';

// @desc    Get USD/CNY rate snapshot
// @route   GET /api/fx/usd-cny
// @access  Public
// 契约：有可用快照 → 200 { rate, fetchedAt, state: available|stale }
//        完全不可用（从未成功获取）→ 503 { messageKey: fx.unavailable }
const getUsdCny = asyncHandler(async (req, res) => {
  try {
    const snapshot = fxService.getSnapshot();
    res.json(snapshot);
  } catch (err) {
    if (err instanceof FxUnavailableError) {
      res.status(503).json({
        message: 'FX rate completely unavailable',
        messageKey: 'fx.unavailable',
      });
      return;
    }
    throw err;
  }
});

export { getUsdCny };
