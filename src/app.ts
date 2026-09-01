import express, { Application } from 'express';
import cardRoutes from './routes/card.routes';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';

const app: Application = express();

// Global Middlewares
app.use(express.json());

// Routes
app.use('/api/v1/cards', cardRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandlerMiddleware);

export default app;
