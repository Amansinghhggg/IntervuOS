import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import interviewRoutes from "./modules/interview/routes/interview.routes.js";
import mockInterviewRoutes from "./modules/interview/routes/mockInterview.routes.js";
import voiceRoutes from "./modules/voice/routes/voice.routes.js";
import profileRoutes from "./modules/users/profile.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import complaintRoutes from "./modules/complaints/complaint.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
  "https://forktalent.vercel.app",
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/mock-interviews", mockInterviewRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/candidates", profileRoutes); // For /api/candidates/:candidateId/resume
app.use("/api/payments", paymentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);


// Global Error Handler
app.use(errorHandler);

export default app;
