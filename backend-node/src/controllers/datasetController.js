import Dataset from "../models/Dataset.js";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

/* ====================================================
   CONSTANTS (IMPORTANT)
==================================================== */

// Python executable (venv)
const PYTHON_PATH = path.resolve(
  "../ml-engine/venv/Scripts/python.exe"
);

// ML engine root directory
const ML_ENGINE_ROOT = path.resolve("../ml-engine");

/* ====================================================
   GET /api/datasets
==================================================== */
export const getAllDatasets = async (req, res) => {
  const datasets = await Dataset.find().sort({ uploadedAt: -1 });

  return res.json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
};

/* ====================================================
   GET /api/datasets/:id
==================================================== */
export const getDatasetById = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset) {
    return res.status(404).json({
      success: false,
      message: "Dataset not found",
    });
  }

  // Convert to object and add path alias for frontend compatibility
  const datasetObj = dataset.toObject();
  datasetObj.path = datasetObj.filepath;

  return res.json({
    success: true,
    data: datasetObj,
  });
};

/* ====================================================
   PATCH /api/datasets/:id/status
==================================================== */
export const updateDatasetStatus = async (req, res) => {
  const { status } = req.body;

  const allowedStatus = ["uploaded", "cleaned", "trained", "ready"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value: ${status}`,
    });
  }

  const dataset = await Dataset.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!dataset) {
    return res.status(404).json({
      success: false,
      message: "Dataset not found",
    });
  }

  return res.json({
    success: true,
    message: "Dataset status updated",
    data: dataset,
  });
};

/* ====================================================
   POST /api/datasets/:id/clean
==================================================== */
export const cleanDataset = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset) {
    return res.status(404).json({
      success: false,
      message: "Dataset not found",
    });
  }

  if (dataset.status !== "uploaded") {
    return res.status(400).json({
      success: false,
      message: "Dataset must be in uploaded state",
    });
  }

  const csvPath = path.resolve(dataset.filepath);
  const scriptPath = path.resolve("../ml-engine/clean_data.py");

  exec(
    `"${PYTHON_PATH}" "${scriptPath}" "${csvPath}"`,
    { cwd: ML_ENGINE_ROOT },
    async (error, stdout, stderr) => {
      if (error) {
        console.error("❌ CLEAN ERROR:", error);
        console.error("STDERR:", stderr);

        return res.status(500).json({
          success: false,
          message: "Data cleaning failed",
        });
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch (err) {
        console.error("❌ CLEAN JSON PARSE ERROR:", stdout);
        return res.status(500).json({
          success: false,
          message: "Invalid response from cleaning script",
        });
      }

      // 🔥 ABSOLUTE PATHS (CRITICAL FIX)
      dataset.cleanedFilePath = path.resolve(
        ML_ENGINE_ROOT,
        result.cleaned_file
      );

      dataset.analysisPath = path.resolve(
        ML_ENGINE_ROOT,
        result.report_file
      );

      dataset.status = "cleaned";
      await dataset.save();

      return res.json({
        success: true,
        message: "Dataset cleaned successfully",
        data: dataset,
      });
    }
  );
};

/* ====================================================
   POST /api/datasets/:id/train
==================================================== */
export const trainDataset = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset) {
    return res.status(404).json({
      success: false,
      message: "Dataset not found",
    });
  }

  if (dataset.status !== "cleaned") {
    return res.status(400).json({
      success: false,
      message: "Dataset must be cleaned before training",
    });
  }

  if (!dataset.cleanedFilePath) {
    return res.status(400).json({
      success: false,
      message: "Cleaned file path missing",
    });
  }

  const scriptPath = path.resolve("../ml-engine/train_model.py");

  console.log("👉 TRAINING FILE:", dataset.cleanedFilePath);

  exec(
    `"${PYTHON_PATH}" "${scriptPath}" "${dataset.cleanedFilePath}"`,
    { cwd: ML_ENGINE_ROOT },
    async (error, stdout, stderr) => {
      if (error) {
        console.error("❌ TRAIN ERROR:", error);
        console.error("STDERR:", stderr);

        return res.status(500).json({
          success: false,
          message: "Model training failed",
        });
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch (err) {
        console.error("❌ TRAIN JSON PARSE ERROR:", stdout);
        return res.status(500).json({
          success: false,
          message: "Invalid response from training script",
        });
      }

      dataset.modelPath = path.resolve(
        ML_ENGINE_ROOT,
        result.model_file
      );

      dataset.metricsPath = path.resolve(
        ML_ENGINE_ROOT,
        result.metrics_file
      );

      dataset.status = "trained";
      await dataset.save();

      return res.json({
        success: true,
        message: "Model trained successfully",
        data: dataset,
      });
    }
  );
};

/* ====================================================
   GET /api/datasets/:id/analysis
==================================================== */
export const getAnalysis = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset?.analysisPath) {
    return res.status(404).json({
      success: false,
      message: "Analysis not found",
    });
  }

  const analysis = fs.readFileSync(dataset.analysisPath, "utf-8");

  return res.json(JSON.parse(analysis));
};

/* ====================================================
   GET /api/datasets/:id/metrics
==================================================== */
export const getMetrics = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset?.metricsPath) {
    return res.status(404).json({
      success: false,
      message: "Metrics not found",
    });
  }

  const metrics = fs.readFileSync(dataset.metricsPath, "utf-8");

  return res.json(JSON.parse(metrics));
};
