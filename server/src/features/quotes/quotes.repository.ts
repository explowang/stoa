import { getDatabase } from '../../shared/database/db';
import { Quote, Theme, PaginationParams } from '../../shared/types';

interface QuoteRow {
  id: string;
  philosopher_id: string;
  content: string;
  content_original: string | null;
  source: string;
  source_work: string | null;
  themes: string;
  image_url: string | null;
  year: number | null;
  context: string | null;
  is_verified: number;
}

function rowToQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    philosopherId: row.philosopher_id,
    content: row.content,
    contentOriginal: row.content_original || undefined,
    source: row.source,
    sourceWork: row.source_work || undefined,
    themes: JSON.parse(row.themes) as Theme[],
    imageUrl: row.image_url || undefined,
    year: row.year || undefined,
    context: row.context || undefined,
    isVerified: row.is_verified === 1,
  };
}

export const quotesRepository = {
  async findRandom(theme?: Theme, philosopherId?: string): Promise<Quote | null> {
    const db = getDatabase();
    
    let rows: QuoteRow[];
    
    if (theme && philosopherId) {
      rows = await db`SELECT * FROM quotes WHERE themes LIKE ${'%"' + theme + '"%'} AND philosopher_id = ${philosopherId} ORDER BY RANDOM() LIMIT 1`;
    } else if (theme) {
      rows = await db`SELECT * FROM quotes WHERE themes LIKE ${'%"' + theme + '"%'} ORDER BY RANDOM() LIMIT 1`;
    } else if (philosopherId) {
      rows = await db`SELECT * FROM quotes WHERE philosopher_id = ${philosopherId} ORDER BY RANDOM() LIMIT 1`;
    } else {
      rows = await db`SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1`;
    }
    
    const row = rows[0];
    return row ? rowToQuote(row) : null;
  },

  async findMany(
    pagination: PaginationParams,
    theme?: Theme,
    philosopherId?: string
  ): Promise<{ quotes: Quote[]; total: number }> {
    const db = getDatabase();
    
    let whereClause = '1=1';
    const params: string[] = [];
    
    if (theme) {
      whereClause += ' AND themes LIKE $' + (params.length + 1);
      params.push(`%"${theme}"%`);
    }
    
    if (philosopherId) {
      whereClause += ' AND philosopher_id = $' + (params.length + 1);
      params.push(philosopherId);
    }
    
    const countResult = await db.unsafe(
      `SELECT COUNT(*) as count FROM quotes WHERE ${whereClause}`,
      params
    );
    const total = Number(countResult[0].count);
    
    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await db.unsafe(
      `SELECT * FROM quotes WHERE ${whereClause} ORDER BY year ASC, id ASC LIMIT ${pagination.limit} OFFSET ${offset}`,
      params
    );
    
    return {
      quotes: (rows as unknown as QuoteRow[]).map(rowToQuote),
      total,
    };
  },

  async findById(id: string): Promise<Quote | null> {
    const db = getDatabase();
    const rows = await db`SELECT * FROM quotes WHERE id = ${id}`;
    const row = rows[0] as QuoteRow | undefined;
    return row ? rowToQuote(row) : null;
  },

  async findByPhilosopher(philosopherId: string, pagination: PaginationParams): Promise<{ quotes: Quote[]; total: number }> {
    return this.findMany(pagination, undefined, philosopherId);
  },

  async findByTheme(theme: Theme, pagination: PaginationParams): Promise<{ quotes: Quote[]; total: number }> {
    return this.findMany(pagination, theme);
  },

  async getThemes(): Promise<string[]> {
    const db = getDatabase();
    const rows = await db`SELECT DISTINCT themes FROM quotes`;
    const themeSet = new Set<string>();
    (rows as unknown as { themes: string }[]).forEach(row => {
      const themes = JSON.parse(row.themes) as Theme[];
      themes.forEach(t => themeSet.add(t));
    });
    return Array.from(themeSet).sort();
  },
};
