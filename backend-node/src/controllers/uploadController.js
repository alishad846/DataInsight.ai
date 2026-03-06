import Dataset from "../models/Dataset.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import mongoose from "mongoose";
import { createJob } from "../services/jobService.js";
import jobService from "../services/jobService.js";

export const uploadDataset = async (req, res) => {
  try {

    const job_id = uuidv4(); // CREATES A JOB_ID

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use key 'file'."
      });
    }

    const absoluteFilePath = path.resolve(req.file.path);

    const fileInfo = {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: absoluteFilePath
    };

    console.log("Upload request received:", fileInfo);

    const mongoConnected = mongoose.connection.readyState === 1;

    if (!mongoConnected) {
      return res.status(500).json({
        success: false,
        message: "MongoDB is not connected. Upload aborted."
      });
    }

    const dataset = await Dataset.create({
      job_id,
      filename: req.file.originalname,
      filepath: absoluteFilePath,
      status: "UPLOADED"
    });

    const datasetId = dataset._id.toString();

    console.log("Dataset stored:", datasetId);

    const job = await createJob({
      job_id,
      dataset_id: datasetId,
      filepath: absoluteFilePath
    });

    console.log("Job created:", job.job_id);

    return res.status(200).json({
      success: true,
      dataset: {
        dataset_id: datasetId,
        filename: dataset.filename,
        filepath: dataset.filepath
      },
      job: {
        job_id: job.job_id,
        stage: job.stage
      },
      file: {
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: "Dataset uploaded successfully. Processing job created."
    });

  } catch (error) {

    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });

  }
};