import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri:     process.env.MONGODB_URI || 'mongodb://localhost:27017/careers',
  jwtSecret:    process.env.JWT_SECRET  || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  port:         parseInt(process.env.PORT || '4000', 10),
  nodeEnv:      process.env.NODE_ENV || 'development',
  isDev:        process.env.NODE_ENV !== 'production',
  frontendUrl:  process.env.FRONTEND_URL || 'http://localhost:5173',
};
