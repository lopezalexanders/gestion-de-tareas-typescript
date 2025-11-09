import { Router } from 'express';

import { tasksController } from '../controllers/tasks.controller.js';
import { checkAuth, checkPermissions } from '../middlewares/auth.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskStatusSchema,
} from '../validations/tasks.schema.js';

const router = Router();

router.post(
  '/',
  checkAuth,
  checkPermissions('tasks:write'),
  validateBody(createTaskSchema),
  (req, res, next) => tasksController.create(req, res).catch(next),
);

router.get(
  '/',
  checkAuth,
  checkPermissions('tasks:read'),
  validateQuery(listTasksQuerySchema),
  (req, res, next) => tasksController.list(req, res).catch(next),
);

router.put(
  '/:id/status',
  checkAuth,
  checkPermissions('tasks:write'),
  validateBody(updateTaskStatusSchema),
  (req, res, next) => tasksController.updateStatus(req, res).catch(next),
);

export default router;
