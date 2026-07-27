// server.js 只负责 listen —— 路由挂载见 app.js (code-standards.mdc 铁律)
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5001;

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
