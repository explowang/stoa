import { Request, Response, NextFunction } from 'express';
import { philosophersService } from './philosophers.service';
import { NotFoundError } from '../../shared/middleware/errorHandler';

export const philosophersController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { school } = req.query;
      const philosophers = await philosophersService.getAll(school as string | undefined);
      res.json({
        success: true,
        data: philosophers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const philosopher = await philosophersService.getByIdWithQuoteCount(id);
      
      if (!philosopher) {
        throw new NotFoundError('Philosopher', id);
      }

      res.json({
        success: true,
        data: philosopher,
      });
    } catch (error) {
      next(error);
    }
  },
};
