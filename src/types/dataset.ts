export interface Dataset {
  _id: string;
  filename: string;
  filepath: string;
  status: "uploaded" | "cleaned" | "trained" | "ready";
  uploadedAt: string;

  cleanedFilePath?: string;
  analysisPath?: string;
  modelPath?: string;
  metricsPath?: string;
}
