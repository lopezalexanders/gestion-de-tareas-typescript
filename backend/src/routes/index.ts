import { Router } from 'express';

import { healthController } from '../controllers/health.controller.js';

import tasksRouter from './tasks.routes.js';

const router = Router();

router.get('/health', healthController);
router.use('/tasks', tasksRouter);

export default router;
