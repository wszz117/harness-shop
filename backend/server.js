// server.js 只负责 listen —— 路由挂载见 app.js (code-standards.mdc 铁律)
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import app from './app.js';
import fxService from './services/fxService.js';

const port = process.env.PORT || 5001;

connectDB();
// 启动即拉取一次汇率并按 FX_REFRESH_INTERVAL_MS 定时刷新（v1.1 修复：此前从未接线，接口恒为 503）
fxService.startAutoRefresh();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
