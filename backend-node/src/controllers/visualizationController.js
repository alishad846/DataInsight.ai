import Dataset from "../models/Dataset.js";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export const getVisualization = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset || !dataset.cleanedFilePath) {
      return res.status(404).json({
        success: false,
        message: "Visualization data not available",
      });
    }

    const scriptPath = path.resolve("../ml-engine/visualize.py");

    exec(
      `python "${scriptPath}" "${dataset.cleanedFilePath}"`,
      { cwd: path.resolve("../ml-engine") },
      (error, stdout, stderr) => {
        if (error) {
          console.error("VISUAL ERROR:", error);
          console.error(stderr);
          return res.status(500).json({
            success: false,
            message: "Visualization generation failed",
          });
        }

        const result = JSON.parse(stdout);
        const visualData = fs.readFileSync(
          path.resolve("../ml-engine", result.visual_file),
          "utf-8"
        );

        return res.json({
          success: true,
          data: JSON.parse(visualData),
        });
      }
    );
  } catch (err) {
    console.error("VISUAL CONTROLLER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
