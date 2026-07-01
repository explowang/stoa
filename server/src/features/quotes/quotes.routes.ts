import { Router } from 'express';
import { quotesController } from './quotes.controller';

const router = Router();

// GET /api/quotes/random - 获取随机语录
router.get('/random', quotesController.getRandom);

// GET /api/quotes/themes - 获取所有主题
router.get('/themes', quotesController.getThemes);

// GET /api/quotes - 获取语录列表
router.get('/', quotesController.getMany);

// GET /api/quotes/:id - 获取单条语录
router.get('/:id', quotesController.getById);

// GET /api/quotes/philosopher/:id - 获取哲学家的语录
router.get('/philosopher/:id', quotesController.getByPhilosopher);

// GET /api/quotes/theme/:theme - 按主题获取语录
router.get('/theme/:theme', quotesController.getByTheme);

export default router;
