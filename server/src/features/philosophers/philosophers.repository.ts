import { getDatabase } from '../../shared/database/db';
import { Philosopher } from '../../shared/types';

interface PhilosopherRow {
  id: string;
  name: string;
  name_en: string;
  name_greek: string | null;
  birth_year: number;
  death_year: number;
  school: string;
  school_en: string;
  region: string;
  biography: string;
  core_ideas: string;
  portrait: string;
}

function rowToPhilosopher(row: PhilosopherRow): Philosopher {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    nameGreek: row.name_greek || undefined,
    birthYear: row.birth_year,
    deathYear: row.death_year,
    school: row.school,
    schoolEn: row.school_en,
    region: row.region,
    biography: row.biography,
    coreIdeas: JSON.parse(row.core_ideas),
    portrait: row.portrait,
  };
}

export const philosophersRepository = {
  async findAll(): Promise<Philosopher[]> {
    const db = getDatabase();
    const rows = await db`SELECT * FROM philosophers ORDER BY birth_year`;
    return (rows as PhilosopherRow[]).map(rowToPhilosopher);
  },

  async findById(id: string): Promise<Philosopher | null> {
    const db = getDatabase();
    const rows = await db`SELECT * FROM philosophers WHERE id = ${id}`;
    const row = rows[0] as PhilosopherRow | undefined;
    return row ? rowToPhilosopher(row) : null;
  },

  async findBySchool(school: string): Promise<Philosopher[]> {
    const db = getDatabase();
    const rows = await db`SELECT * FROM philosophers WHERE school LIKE ${'%' + school + '%'} ORDER BY birth_year`;
    return (rows as PhilosopherRow[]).map(rowToPhilosopher);
  },

  async getQuoteCount(philosopherId: string): Promise<number> {
    const db = getDatabase();
    const rows = await db`SELECT COUNT(*) as count FROM quotes WHERE philosopher_id = ${philosopherId}`;
    return Number(rows[0].count);
  },
};
