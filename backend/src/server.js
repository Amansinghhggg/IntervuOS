import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startEvaluationWorker } from "./workers/evaluationWorker.js";
import { startUploadWorker } from "./workers/uploadWorker.js";

const PORT = process.env.PORT || 5000;

// Connect to database, start background workers, and listen on port
connectDB().then(() => {
  // Start background BullMQ workers for AI evaluation & video processing
  startEvaluationWorker();
  startUploadWorker();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
