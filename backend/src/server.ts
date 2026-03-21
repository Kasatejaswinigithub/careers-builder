import app from './app';
import { connectDB } from './db/connect';
import { config } from './config';

async function start() {
  await connectDB();
  const server = app.listen(config.port, () => {
    console.log('Server running on http://localhost:' + config.port + ' [' + config.nodeEnv + ']');
  });
  const shutdown = async (signal: string) => {
    console.log(signal + ' received. Shutting down...');
    server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
