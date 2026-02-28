import React, { useState } from "react";
import Papa from "papaparse";
import DataPreview from "./DataPreview";
import QualityScore from "./QualityScore";
import { analyzeData, ColumnInfo } from "./dataAnalyzer";
import ConfigurationSummary from "./configuration";

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  category: string;
  targetColumn: string;
  summary: string;
  ignoredColumns: string[];
  hasMissingValues: boolean;
}

interface Props {
  onFileUpload: (file: FileData) => void;
}

const UploadBox: React.FC<Props> = ({ onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("sales");
  const [ignoredColumns, setIgnoredColumns] = useState<string[]>([]);
  const [hasMissing, setHasMissing] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [suggestedTask, setSuggestedTask] = useState("Unknown");
  const [showModal, setShowModal] = useState(false);

  const isFormValid =
    file !== null && targetColumn !== "" && summary.length >= 5;

  /* ===== CSV PARSE ===== */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return;

    const uploadedFile = e.target.files[0];

    if (!uploadedFile.name.endsWith(".csv")) return;

    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data;
        const headers = results.meta.fields;

        setRawData(data);

        const analysis = analyzeData(
          data,
          headers,
          targetColumn,
          summary
        );

        setColumns(analysis.columns);
        setIgnoredColumns(analysis.suggestedIgnored);
        setHasMissing(analysis.hasMissing);
        setQualityScore(analysis.qualityScore);
        setSuggestedTask(analysis.suggestedTask);
      },
    });
  };

  /* ===== Re-analyze when target or summary changes ===== */

  React.useEffect(() => {
    if (!rawData.length || !columns.length) return;

    const headers = columns.map((c) => c.name);

    const analysis = analyzeData(
      rawData,
      headers,
      targetColumn,
      summary
    );

    setQualityScore(analysis.qualityScore);
    setSuggestedTask(analysis.suggestedTask);
  }, [targetColumn, summary]);

  /* ===== Confirm Upload ===== */

  const handleConfirmUpload = () => {
    if (!file) return;

    onFileUpload({
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      category,
      targetColumn,
      summary,
      ignoredColumns,
      hasMissingValues: hasMissing,
    });

    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      <h2 className="text-3xl font-semibold">
        Dataset Configuration & Upload
      </h2>

      <div className="grid grid-cols-4 gap-8">

        {/* LEFT: CONFIGURATION */}
        <div className="col-span-1 bg-white p-6 rounded-xl border shadow-sm space-y-6">

          <div>
            <label className="block font-medium mb-2">
              Type of Data
            </label>
            <select
              className="w-full border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="sales">Sales</option>
              <option value="employees">Employees</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Short Summary
            </label>
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            {summary.length < 5 && (
              <p className="text-red-500 text-xs mt-1">
                Minimum 5 characters required.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">
              Target Column
            </label>
            <select
              className="w-full border p-2 rounded"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
            >
              <option value="">Select column</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm">
              Missing Values Detected:{" "}
              <span className="font-semibold">
                {hasMissing ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </div>

        {/* CENTER: PREVIEW */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-medium mb-2">
              Upload CSV File
            </label>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />

            {file && (
              <p className="text-sm mt-3">
                <strong>File:</strong> {file.name}
              </p>
            )}
          </div>

          <DataPreview data={rawData} />
        </div>

        {/* RIGHT: SCORE */}
        <div className="col-span-1">
          <QualityScore
            score={qualityScore}
            task={suggestedTask}
          />
        </div>
      </div>

      {/* REVIEW BUTTON */}
      <button
        disabled={!isFormValid}
        onClick={() => setShowModal(true)}
        className={`px-6 py-3 rounded-lg text-white ${isFormValid
          ? "bg-gray-900"
          : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Review & Finalize
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[500px] space-y-4">
            <h3 className="text-xl font-semibold">
              Confirm Dataset Submission
            </h3>

            <p><strong>Type:</strong> {category}</p>
            <p><strong>Target:</strong> {targetColumn}</p>
            <p><strong>Score:</strong> {qualityScore}/100</p>
            <p><strong>Suggested Task:</strong> {suggestedTask}</p>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBox;