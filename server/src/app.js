import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { responseHandler } from './utils/responseHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
// Allow connections from standard development frontends (e.g. Vite on port 5173)
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Base route / healthcheck
app.get('/health', (req, res) => {
  return responseHandler.success(res, { status: 'healthy', time: new Date() }, 'Workflow system API is running.');
});

// Catch 404 (NotFound) API routes
app.use('*', (req, res) => {
  return responseHandler.error(res, `Route [${req.method}] ${req.baseUrl} not found.`, null, 404);
});

// Register Global Error Middleware
app.use(errorMiddleware);

export default app;
