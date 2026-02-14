import mongoose from "mongoose";

/* ----------------------------------------
   Dataset Schema
   Handles full ML lifecycle metadata
---------------------------------------- */

const DatasetSchema = new mongoose.Schema(
  {
    /* ---------- BASIC FILE INFO ---------- */
    filename: {
      type: String,
      required: true,
      trim: true,
    },

    filepath: {
      type: String,
      required: true,
    },

    /* ---------- PIPELINE STATUS ---------- */
    status: {
      type: String,
      enum: ["uploaded", "cleaned", "trained", "ready"],
      default: "uploaded",
    },

    /* ---------- ML PIPELINE ARTIFACTS ---------- */
    cleanedFilePath: {
      type: String,
      default: null,
    },

    analysisPath: {
      type: String,
      default: null,
    },

    modelPath: {
      type: String,
      default: null,
    },

    metricsPath: {
      type: String,
      default: null,
    },

    /* ---------- METADATA ---------- */
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export default mongoose.model("Dataset", DatasetSchema);
