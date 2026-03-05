import mongoose from "mongoose";

const DatasetSchema = new mongoose.Schema(
  {
    /* ---------- EXTERNAL JOB ID ---------- */
    job_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

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

    /* ---------- JOB STATE MACHINE ---------- */
    status: {
      type: String,
      enum: [
        "UPLOADED",
        "ETL_RUNNING",
        "ETL_COMPLETED",
        "TRAINING_RUNNING",
        "TRAINING_COMPLETED",
        "REPORT_GENERATED",
        "INDEXED",
        "COMPLETED",
        "FAILED",
      ],
      default: "UPLOADED",
    },

    /* ---------- ERROR HANDLING ---------- */
    error_message: {
      type: String,
      default: null,
    },

    /* ---------- ML ARTIFACTS ---------- */
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

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Dataset", DatasetSchema);
