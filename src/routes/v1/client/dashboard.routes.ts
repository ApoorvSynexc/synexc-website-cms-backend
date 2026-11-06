import { Router } from 'express';
import { dashboardController } from '../../../controller/index.js';

const router = Router();

router.get('/stats', dashboardController.statsHandler);

export const dashboardRouter = router;
