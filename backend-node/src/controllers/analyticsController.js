import { spawn } from "child_process";
import path from "path";

export const analyticsSummary = async (req, res) => {
  const pythonProcess = spawn("python", [
    path.resolve("../ml-engine/run_summary.py"),
    JSON.stringify(req.body),
  ]);

  let stdout = "";
  let stderr = "";

  pythonProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  pythonProcess.on("close", (code) => {
    // ❌ Python error
    if (code !== 0 || stderr) {
      console.error("Python error:", stderr);
      return res.status(500).json({
        error: "Analytics computation failed",
        details: stderr,
      });
    }

    // ❌ No output
    if (!stdout.trim()) {
      return res.status(500).json({
        error: "No output received from analytics engine",
      });
    }

    try {
      const result = JSON.parse(stdout);

      const insights = [
        {
          key: "trend",
          title: "Revenue Trend",
          value: result.trend !== null ? `${result.trend}%` : "N/A",

          description: "Change from previous period",
        },
        {
          key: "worst",
          title: "Top Loss Year",
          value: `${result.worst_year}`,
          description: "Lowest aggregated value",
        },
        {
          key: "total",
          title: "Total Revenue",
          value: `$${(result.total / 1000).toFixed(1)}K`,
          description: "Across all periods",
        },
        {
          key: "average",
          title: "Average Profit",
          value: `$${(result.average / 1000).toFixed(2)}K`,
          description: "Mean across dataset",
        },
        {
          key: "best",
          title: "Best Year",
          value: `${result.best_year}`,
          description: "Highest performing period",
        },
        {
          key: "growth",
          title: "Growth Rate",
          value: result.growth !== null ? `${result.growth}%` : "N/A",

          description: "Compound annual growth",
        },
      ];

      res.json({ insights });
    } catch (err) {
      console.error("Invalid JSON from Python:", stdout);
      res.status(500).json({
        error: "Invalid JSON from analytics engine",
        raw: stdout,
      });
    }
  });
};
export const analyticsChart = async (req, res) => {
const python = spawn(
  "python",
  [path.resolve("../ml-engine/run_charts.py")],
  {
    cwd: path.resolve("../ml-engine"), // ✅ THIS IS THE FIX
  }
);

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", d => stdout += d.toString());
  python.stderr.on("data", d => stderr += d.toString());

  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();

  python.on("close", () => {
    if (stderr) {
      return res.status(500).json({ error: stderr });
    }
    res.json(JSON.parse(stdout));
  });
};
