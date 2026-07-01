import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string || 
    Math.random().toString(36).substring(2, 15);

  // Add requestId to request
  req.headers['x-request-id'] = requestId;

  // Log request
  console.log(JSON.stringify({
    level: 'info',
    type: 'request',
    method: req.method,
    path: req.path,
    requestId,
    timestamp: new Date().toISOString(),
  }));

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      level: 'info',
      type: 'response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      requestId,
      timestamp: new Date().toISOString(),
    }));
  });

  next();
}
