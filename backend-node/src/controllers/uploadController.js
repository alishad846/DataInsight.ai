import Dataset from "../models/Dataset.js";
import path from "path";
import mongoose from "mongoose";

export const uploadDataset = async (req, res) => {
  try {
    console.log("📤 Upload request received");
    console.log("File:", req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      mimetype: req.file.mimetype
    } : "No file");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use key 'file'.",
      });
    }

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      console.warn("⚠️ MongoDB is not connected - using fallback mode");
      // Fallback: return file info without saving to database
      const fallbackId = `temp-${Date.now()}`;
      return res.status(200).json({
        success: true,
        datasetId: fallbackId,
        path: path.resolve(req.file.path),
        originalName: req.file.originalname,
        size: req.file.size,
        data: {
          _id: fallbackId,
          id: fallbackId,
          path: path.resolve(req.file.path),
          filename: req.file.originalname,
        },
        warning: "File uploaded but not saved to database. MongoDB connection required for persistence.",
      });
    }

    console.log("💾 Saving to database...");
    // Save dataset to database
    const dataset = await Dataset.create({
      filename: req.file.originalname,
      filepath: path.resolve(req.file.path),
      status: "uploaded",
    });

    console.log("✅ Dataset saved:", dataset._id.toString());

    return res.status(200).json({
      success: true,
      datasetId: dataset._id.toString(),
      path: dataset.filepath,
      originalName: dataset.filename,
      size: req.file.size,
      data: {
        _id: dataset._id.toString(),
        id: dataset._id.toString(),
        path: dataset.filepath,
        filename: dataset.filename,
      },
    });
  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Send detailed error message to frontend
    res.status(500).json({ 
      success: false, 
      message: error.message || "Upload failed",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
