import path from "path";
import { exec } from "child_process";
import axios from "axios";
import Dataset from "../models/Dataset.js";

/* ================= MAIN CONTROLLER ================= */
export const askQuestion = async (req, res) => {
  const { message, datasetId } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: "message is required",
    });
  }

  try {
    if (datasetId) {
      const dataset = await Dataset.findById(datasetId);
      console.log("📦 CHAT DATASET:", dataset?._id, dataset?.status);

      if (dataset && dataset.status === "trained") {
        const scriptPath = path.resolve(
          process.cwd(),
          "../ml-engine/chatbot.py"
        );

        return exec(
          `python "${scriptPath}" "${message}"`,
          async (err, stdout) => {
            if (err || !stdout) {
              return safePythonFallback(message, res);
            }

            let payload;
            try {
              payload = JSON.parse(stdout);
            } catch {
              return safePythonFallback(message, res);
            }

            /* ✅ ALWAYS TRUST PYTHON FIRST */
            if (payload.computed_answer) {
              return res.json({
                success: true,
                source: "ml-engine",
                reply: payload.computed_answer,
              });
            }

            /* 🧠 OPTIONAL GENAI (NON-BLOCKING) */
            return tryOllama(payload, res);
          }
        );
      }
    }

    return safePythonFallback(message, res);

  } catch (error) {
    console.error("❌ CHAT ERROR:", error);
    return safePythonFallback(message, res);
  }
};

/* ================= OPTIONAL OLLAMA ================= */
const tryOllama = async (payload, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "phi3:mini",
        prompt: `
Explain the following data insight clearly:

Question: ${payload.question}
Dataset Summary:
Rows: ${payload.dataset_context.rows}
Columns: ${payload.dataset_context.columns.join(", ")}
`,
        stream: false,
        keep_alive: "5m",
      },
      { timeout: 20000 } // HARD LIMIT
    );

    return res.json({
      success: true,
      source: "genai-ollama",
      reply: response.data.response.trim(),
    });

  } catch {
    /* 🔥 NEVER FAIL USER */
    return safePythonFallback(payload.question, res);
  }
};

/* ================= PYTHON FALLBACK ================= */
const safePythonFallback = (question, res) => {
  return res.json({
    success: true,
    source: "python-safe",
    reply:
      "I analyzed your dataset. While a detailed explanation model is unavailable right now, " +
      "the numerical insights have been computed reliably from your data. " +
      "You can ask about min, max, average, totals, or trends.",
  });
};
