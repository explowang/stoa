import { philosophersRepository } from './philosophers.repository';
import { Philosopher } from '../../shared/types';

export const philosophersService = {
  async getAll(school?: string): Promise<Philosopher[]> {
    if (school) {
      return philosophersRepository.findBySchool(school);
    }
    return philosophersRepository.findAll();
  },

  async getById(id: string): Promise<Philosopher | null> {
    return philosophersRepository.findById(id);
  },

  async getByIdWithQuoteCount(id: string): Promise<(Philosopher & { quoteCount: number }) | null> {
    const philosopher = await philosophersRepository.findById(id);
    if (!philosopher) {
      return null;
    }
    const quoteCount = await philosophersRepository.getQuoteCount(id);
    return { ...philosopher, quoteCount };
  },
};
