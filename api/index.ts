import { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';

let sql: postgres.Sql | null = null;

function getDatabase(): postgres.Sql {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = postgres(databaseUrl, {
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    });
  }
  return sql;
}

// Simple auth check
function checkAuth(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'stoa2024';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  return token === adminPassword;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getDatabase();
  const url = new URL(req.url!, `https://${req.headers.host}`);
  const pathname = url.pathname;
  const path = pathname.replace(/^\/api\//, '');

  try {
    // Health check (no auth required)
    if (path === 'health' || path === '') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // ============ READ OPERATIONS (No auth required) ============

    // Random quote
    if (path === 'quotes/random' && req.method === 'GET') {
      const theme = url.searchParams.get('theme');
      const philosopherId = url.searchParams.get('philosopherId');
      
      let rows;
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
      if (!row) {
        return res.status(404).json({ success: false, error: 'No quotes found' });
      }
      
      const philosophers = await db`SELECT * FROM philosophers WHERE id = ${row.philosopher_id}`;
      const philosopher = philosophers[0];
      
      return res.json({
        success: true,
        data: {
          id: row.id,
          philosopherId: row.philosopher_id,
          content: row.content,
          contentOriginal: row.content_original,
          source: row.source,
          sourceWork: row.source_work,
          themes: JSON.parse(row.themes),
          isVerified: row.is_verified === 1,
          philosopher: philosopher ? {
            id: philosopher.id,
            name: philosopher.name,
            nameEn: philosopher.name_en,
            portrait: philosopher.portrait,
          } : null,
        },
      });
    }

    // Quotes themes
    if (path === 'quotes/themes' && req.method === 'GET') {
      const rows = await db`SELECT DISTINCT themes FROM quotes`;
      const themeSet = new Set<string>();
      rows.forEach((row: any) => {
        JSON.parse(row.themes).forEach((t: string) => themeSet.add(t));
      });
      return res.json({ success: true, data: Array.from(themeSet).sort() });
    }

    // Quotes list
    if (path === 'quotes' && req.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      const theme = url.searchParams.get('theme');
      const philosopherId = url.searchParams.get('philosopherId');
      
      let whereClause = '1=1';
      const params: string[] = [];
      
      if (theme) {
        whereClause += ` AND themes LIKE $${params.length + 1}`;
        params.push(`%"${theme}"%`);
      }
      if (philosopherId) {
        whereClause += ` AND philosopher_id = $${params.length + 1}`;
        params.push(philosopherId);
      }
      
      const countResult = await db.unsafe(`SELECT COUNT(*) as count FROM quotes WHERE ${whereClause}`, params);
      const total = Number(countResult[0].count);
      
      const offset = (page - 1) * limit;
      const rows = await db.unsafe(
        `SELECT * FROM quotes WHERE ${whereClause} ORDER BY year ASC, id ASC LIMIT ${limit} OFFSET ${offset}`,
        params
      );
      
      return res.json({
        success: true,
        data: rows.map((row: any) => ({
          id: row.id,
          philosopherId: row.philosopher_id,
          content: row.content,
          source: row.source,
          themes: JSON.parse(row.themes),
          isVerified: row.is_verified === 1,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Quote by ID
    if (path.startsWith('quotes/') && !path.includes('random') && !path.includes('themes') && !path.includes('philosopher') && !path.includes('theme') && req.method === 'GET') {
      const id = path.split('/')[1];
      const rows = await db`SELECT * FROM quotes WHERE id = ${id}`;
      const row = rows[0];
      
      if (!row) {
        return res.status(404).json({ success: false, error: 'Quote not found' });
      }
      
      return res.json({
        success: true,
        data: {
          id: row.id,
          philosopherId: row.philosopher_id,
          content: row.content,
          source: row.source,
          themes: JSON.parse(row.themes),
          isVerified: row.is_verified === 1,
        },
      });
    }

    // Quotes by philosopher
    if (path.startsWith('quotes/philosopher/') && req.method === 'GET') {
      const philosopherId = path.split('/')[2];
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      
      const countResult = await db`SELECT COUNT(*) as count FROM quotes WHERE philosopher_id = ${philosopherId}`;
      const total = Number(countResult[0].count);
      
      const offset = (page - 1) * limit;
      const rows = await db`SELECT * FROM quotes WHERE philosopher_id = ${philosopherId} ORDER BY year ASC LIMIT ${limit} OFFSET ${offset}`;
      
      return res.json({
        success: true,
        data: rows.map((row: any) => ({
          id: row.id,
          philosopherId: row.philosopher_id,
          content: row.content,
          source: row.source,
          themes: JSON.parse(row.themes),
          isVerified: row.is_verified === 1,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Quotes by theme
    if (path.startsWith('quotes/theme/') && req.method === 'GET') {
      const theme = path.split('/')[2];
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      
      const countResult = await db`SELECT COUNT(*) as count FROM quotes WHERE themes LIKE ${'%"' + theme + '"%'}`;
      const total = Number(countResult[0].count);
      
      const offset = (page - 1) * limit;
      const rows = await db`SELECT * FROM quotes WHERE themes LIKE ${'%"' + theme + "%'"} ORDER BY year ASC LIMIT ${limit} OFFSET ${offset}`;
      
      return res.json({
        success: true,
        data: rows.map((row: any) => ({
          id: row.id,
          philosopherId: row.philosopher_id,
          content: row.content,
          source: row.source,
          themes: JSON.parse(row.themes),
          isVerified: row.is_verified === 1,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Philosophers list
    if (path === 'philosophers' && req.method === 'GET') {
      const school = url.searchParams.get('school');
      let rows;
      if (school) {
        rows = await db`SELECT * FROM philosophers WHERE school LIKE ${'%' + school + '%'} ORDER BY birth_year`;
      } else {
        rows = await db`SELECT * FROM philosophers ORDER BY birth_year`;
      }
      
      return res.json({
        success: true,
        data: rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          nameEn: row.name_en,
          nameGreek: row.name_greek,
          birthYear: row.birth_year,
          deathYear: row.death_year,
          school: row.school,
          schoolEn: row.school_en,
          region: row.region,
          biography: row.biography,
          coreIdeas: JSON.parse(row.core_ideas),
          portrait: row.portrait,
        })),
      });
    }

    // Philosopher by ID
    if (path.startsWith('philosophers/') && !path.includes('quotes') && req.method === 'GET') {
      const id = path.split('/')[1];
      const rows = await db`SELECT * FROM philosophers WHERE id = ${id}`;
      const row = rows[0];
      
      if (!row) {
        return res.status(404).json({ success: false, error: 'Philosopher not found' });
      }
      
      const quoteCount = await db`SELECT COUNT(*) as count FROM quotes WHERE philosopher_id = ${id}`;
      
      return res.json({
        success: true,
        data: {
          id: row.id,
          name: row.name,
          nameEn: row.name_en,
          nameGreek: row.name_greek,
          birthYear: row.birth_year,
          deathYear: row.death_year,
          school: row.school,
          schoolEn: row.school_en,
          region: row.region,
          biography: row.biography,
          coreIdeas: JSON.parse(row.core_ideas),
          portrait: row.portrait,
          quoteCount: Number(quoteCount[0].count),
        },
      });
    }

    // ============ WRITE OPERATIONS (Auth required) ============

    // Check auth for write operations
    if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
      if (!checkAuth(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    }

    // Create quote
    if (path === 'quotes' && req.method === 'POST') {
      const { id, philosopherId, content, contentOriginal, source, sourceWork, themes } = req.body;
      
      if (!id || !philosopherId || !content || !source) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      await db`
        INSERT INTO quotes (id, philosopher_id, content, content_original, source, source_work, themes, is_verified)
        VALUES (${id}, ${philosopherId}, ${content}, ${contentOriginal || null}, ${source}, ${sourceWork || null}, ${JSON.stringify(themes || [])}, ${1})
      `;
      
      return res.json({ success: true, message: 'Quote created' });
    }

    // Update quote
    if (path.startsWith('quotes/') && req.method === 'PUT') {
      const id = path.split('/')[1];
      const { content, source, themes } = req.body;
      
      await db`
        UPDATE quotes 
        SET content = ${content || ''}, source = ${source || ''}, themes = ${JSON.stringify(themes || [])}
        WHERE id = ${id}
      `;
      
      return res.json({ success: true, message: 'Quote updated' });
    }

    // Delete quote
    if (path.startsWith('quotes/') && req.method === 'DELETE') {
      const id = path.split('/')[1];
      await db`DELETE FROM quotes WHERE id = ${id}`;
      return res.json({ success: true, message: 'Quote deleted' });
    }

    // Create philosopher
    if (path === 'philosophers' && req.method === 'POST') {
      const { id, name, nameEn, nameGreek, birthYear, deathYear, school, schoolEn, region, biography, coreIdeas } = req.body;
      
      if (!id || !name || !nameEn || !birthYear || !deathYear || !school) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      await db`
        INSERT INTO philosophers (id, name, name_en, name_greek, birth_year, death_year, school, school_en, region, biography, core_ideas, portrait)
        VALUES (${id}, ${name}, ${nameEn}, ${nameGreek || null}, ${birthYear}, ${deathYear}, ${school}, ${schoolEn || ''}, ${region || ''}, ${biography || ''}, ${JSON.stringify(coreIdeas || [])}, ${'/assets/images/' + id + '.webp'})
      `;
      
      return res.json({ success: true, message: 'Philosopher created' });
    }

    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
