import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is required');
}

// Helper to clean and split origins
const parseOrigins = (origins: string | undefined): string[] => {
  if (!origins) return ['http://localhost:5173'];
  return origins.split(',').map(url => url.trim().replace(/\/$/, "")); 
  // .map logic above removes extra spaces and trailing slashes which often break CORS
};

export const config = {
  mongoUri,
  jwtSecret:     process.env.JWT_SECRET  || 'dev_secret',
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN || '7d',
  port:          parseInt(process.env.PORT || '4000', 10),
  nodeEnv:       process.env.NODE_ENV || 'development',
  isDev:         process.env.NODE_ENV !== 'production',
  frontendUrl:   process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
};