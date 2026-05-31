import app from './app.js';
import { env } from './config/env.js';
import { initDb } from './config/db.js';

const startServer = async () => {
  try {
    console.log('🚀 Booting Role-Based Workflow System API...');

    // Initialize Database (and run auto-migration + seeding on SQLite if needed)
    await initDb();

    // Listen on configured port
    app.listen(env.PORT, () => {
      console.log(`=============================================`);
      console.log(`🟢 SERVER RUNNING IN: ${env.NODE_ENV}`);
      console.log(`🔌 API ENDPOINT: http://localhost:${env.PORT}`);
      console.log(`🏥 HEALTH CHECK: http://localhost:${env.PORT}/health`);
      console.log(`=============================================`);
    });
  } catch (err) {
    console.error('💥 Fatal Server Crash:', err);
    process.exit(1);
  }
};

startServer();
