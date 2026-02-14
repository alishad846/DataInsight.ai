import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getAllDatasets,
  getDatasetById,
  updateDatasetStatus,
  cleanDataset,
  trainDataset,
  getAnalysis,
  getMetrics,
} from "../controllers/datasetController.js";

const router = express.Router();

/* =====================================================
   DATASET MANAGEMENT (PROTECTED)
===================================================== */

// Get all datasets
router.get("/datasets", protect, getAllDatasets);

// Get dataset by ID
router.get("/datasets/:id", protect, getDatasetById);

// Update dataset status (admin / debug)
router.patch("/datasets/:id/status", protect, updateDatasetStatus);

/* =====================================================
   ML PIPELINE AUTOMATION (PROTECTED)
===================================================== */

// Clean dataset (Python script)
router.post("/datasets/:id/clean",  cleanDataset);

// Train ML model (Python script)
router.post("/datasets/:id/train",  trainDataset);

// Get data analysis report
router.get("/datasets/:id/analysis", protect, getAnalysis);

// Get trained model metrics
router.get("/datasets/:id/metrics", protect, getMetrics);

export default router;
