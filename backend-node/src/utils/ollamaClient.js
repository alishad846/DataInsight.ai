import fetch from "node-fetch";

export const askOllama = async (prompt) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:mini",
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error("Ollama request failed");
  }

  const data = await response.json();
  return data.response;
};
