import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorMiddleware.js";

import analyticsRoutes from "./routes/analyticsRoutes.js";
import visualizationRoutes from "./routes/visualizationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* ========== MIDDLEWARE ========== */
app.use(cors());
app.use(express.json());

/* ========== ROUTES ========== */
app.use("/api/chat", chatRoutes);
app.use("/api/visualization", visualizationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ========== HEALTH CHECK ========== */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ========== DIAGNOSTIC ENDPOINT ========== */
app.get("/api/health", (req, res) => {
  res.json({
    server: "running",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongodbState: mongoose.connection.readyState,
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      port: process.env.PORT || 5000,
    }
  });
});

/* ========== ERROR HANDLER ========== */
app.use(errorHandler);

/* ========== SERVER ========== */
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
