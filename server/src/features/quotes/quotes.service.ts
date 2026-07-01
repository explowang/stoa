import { quotesRepository } from './quotes.repository';
import { philosophersRepository } from '../philosophers/philosophers.repository';
import { Quote, Theme, PaginationParams } from '../../shared/types';

export const quotesService = {
  async getRandom(theme?: Theme, philosopherId?: string) {
    const quote = await quotesRepository.findRandom(theme, philosopherId);
    if (!quote) {
      return null;
    }

    const philosopher = await philosophersRepository.findById(quote.philosopherId);
    if (!philosopher) {
      return null;
    }

    return {
      ...quote,
      philosopher: {
        id: philosopher.id,
        name: philosopher.name,
        nameEn: philosopher.nameEn,
        portrait: philosopher.portrait,
      },
    };
  },

  async getMany(
    pagination: PaginationParams,
    theme?: Theme,
    philosopherId?: string
  ) {
    return quotesRepository.findMany(pagination, theme, philosopherId);
  },

  async getById(id: string) {
    return quotesRepository.findById(id);
  },

  async getByPhilosopher(philosopherId: string, pagination: PaginationParams) {
    return quotesRepository.findByPhilosopher(philosopherId, pagination);
  },

  async getByTheme(theme: Theme, pagination: PaginationParams) {
    return quotesRepository.findByTheme(theme, pagination);
  },

  async getThemes() {
    return quotesRepository.getThemes();
  },
};
