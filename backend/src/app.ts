import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow all localhost ports in development
    if (config.isDev) {
      callback(null, true);
    } else {
      const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
      callback(null, !origin || allowed.includes(origin));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.isDev) app.use(morgan('dev'));

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: config.nodeEnv }));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;
