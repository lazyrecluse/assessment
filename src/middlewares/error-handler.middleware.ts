import { Request, Response, NextFunction } from 'express';

export const errorHandlerMiddleware = (
  err: Error & { status?: number; type?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Express body-parser JSON syntax errors
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    res.status(400).json({
      error: 'Malformed JSON payload in request body.',
    });
    return;
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
};
