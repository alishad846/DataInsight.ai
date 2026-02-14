import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { uploadDataset } from "../controllers/uploadController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Use __dirname to ensure uploads folder is in backend-node directory
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow CSV, Excel, and JSON files
    const allowedMimes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];
    
    const allowedExtensions = [".csv", ".xlsx", ".xls", ".json"];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (
      allowedMimes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExt)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only CSV, Excel, or JSON files are allowed."));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 50MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      // Handle fileFilter errors
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file type",
      });
    }
    next();
  });
}, uploadDataset);

export default router;
