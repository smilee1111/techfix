import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

/**
 * Server entry point.
 * Connects to MongoDB Atlas and starts the Express server.
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🔧 TechFix API Server                     ║
  ║   📍 http://localhost:${env.PORT}                ║
  ║   🌍 Environment: ${env.NODE_ENV.padEnd(22)}  ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
