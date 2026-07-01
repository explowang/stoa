import { Request, Response, NextFunction } from 'express';
import { quotesService } from './quotes.service';
import { NotFoundError, ValidationError } from '../../shared/middleware/errorHandler';
import { Theme } from '../../shared/types';

const VALID_THEMES: Theme[] = [
  'death', 'happiness', 'friendship', 'self-knowledge', 'fate',
  'virtue', 'wisdom', 'justice', 'truth', 'education',
  'politics', 'ethics', 'metaphysics', 'logic', 'nature',
  'time', 'knowledge', 'courage', 'moderation', 'purpose',
];

export const quotesController = {
  async getRandom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { theme, philosopherId } = req.query;

      if (theme && !VALID_THEMES.includes(theme as Theme)) {
        throw new ValidationError(`Invalid theme: ${theme}`);
      }

      const quote = await quotesService.getRandom(
        theme as Theme | undefined,
        philosopherId as string | undefined
      );

      if (!quote) {
        throw new NotFoundError('Quote', 'random');
      }

      res.json({
        success: true,
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const { theme, philosopherId } = req.query;

      if (theme && !VALID_THEMES.includes(theme as Theme)) {
        throw new ValidationError(`Invalid theme: ${theme}`);
      }

      const result = await quotesService.getMany(
        { page, limit },
        theme as Theme | undefined,
        philosopherId as string | undefined
      );

      res.json({
        success: true,
        data: result.quotes,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const quote = await quotesService.getById(id);

      if (!quote) {
        throw new NotFoundError('Quote', id);
      }

      res.json({
        success: true,
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByPhilosopher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await quotesService.getByPhilosopher(id, { page, limit });

      res.json({
        success: true,
        data: result.quotes,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getThemes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const themes = await quotesService.getThemes();
      res.json({
        success: true,
        data: themes,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const theme = req.params.theme as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      if (!VALID_THEMES.includes(theme as Theme)) {
        throw new ValidationError(`Invalid theme: ${theme}`);
      }

      const result = await quotesService.getByTheme(theme as Theme, { page, limit });

      res.json({
        success: true,
        data: result.quotes,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
