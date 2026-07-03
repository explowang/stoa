import express from 'express';
import path from 'path';
import cors from 'cors';
import { config } from './config';
import { logger } from './shared/middleware/logger';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';
import { initializeDatabase, closeDatabase } from './shared/database/db';
import quotesRoutes from './features/quotes/quotes.routes';
import philosophersRoutes from './features/philosophers/philosophers.routes';

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(logger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/quotes', quotesRoutes);
app.use('/api/philosophers', philosophersRoutes);

// Serve static files in production
if (config.nodeEnv === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    app.listen(config.port, config.host, () => {
      console.log(`Server running on http://${config.host}:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await closeDatabase();
  process.exit(0);
});

start();
