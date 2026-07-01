import postgres from 'postgres';

let sql: postgres.Sql | null = null;

export function getDatabase(): postgres.Sql {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();

  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS philosophers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_greek TEXT,
      birth_year INTEGER NOT NULL,
      death_year INTEGER NOT NULL,
      school TEXT NOT NULL,
      school_en TEXT NOT NULL,
      region TEXT NOT NULL,
      biography TEXT NOT NULL,
      core_ideas TEXT NOT NULL,
      portrait TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      philosopher_id TEXT NOT NULL,
      content TEXT NOT NULL,
      content_original TEXT,
      source TEXT NOT NULL,
      source_work TEXT,
      themes TEXT NOT NULL,
      image_url TEXT,
      year INTEGER,
      context TEXT,
      is_verified INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (philosopher_id) REFERENCES philosophers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_philosopher ON quotes(philosopher_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes(themes);
  `);
}
