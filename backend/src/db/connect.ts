import mongoose from 'mongoose';
import { config } from '../config';

export async function connectDB(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected: ' + mongoose.connection.host);
  } catch (err) {
    if (attempt >= 5) { console.error('MongoDB failed. Exiting.'); process.exit(1); }
    console.warn('MongoDB attempt ' + attempt + ' failed. Retrying...');
    await new Promise(r => setTimeout(r, 3000));
    return connectDB(attempt + 1);
  }
}

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
