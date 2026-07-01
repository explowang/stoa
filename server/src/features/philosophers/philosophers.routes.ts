import { Router } from 'express';
import { philosophersController } from './philosophers.controller';

const router = Router();

// GET /api/philosophers - 获取所有哲学家
router.get('/', philosophersController.getAll);

// GET /api/philosophers/:id - 获取哲学家详情
router.get('/:id', philosophersController.getById);

export default router;
