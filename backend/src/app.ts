import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';

const app = express();

// Security headers
app.use(helmet());

// Improved CORS logic
app.use(cors({
  origin: function(origin, callback) {
    // 1. Allow mobile apps, curl, or same-origin requests (where origin is undefined)
    if (!origin) return callback(null, true);

    // 2. Allow if in development mode
    if (config.isDev) return callback(null, true);

    // 3. Check if the requesting website is in our allowed list
    if (config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`); // This helps you debug in Render logs!
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.isDev) app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  env: config.nodeEnv,
  timestamp: new Date().toISOString()
}));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;