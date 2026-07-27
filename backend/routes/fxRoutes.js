import express from 'express';
const router = express.Router();
import { getUsdCny } from '../controllers/fxController.js';

router.route('/usd-cny').get(getUsdCny);

export default router;
