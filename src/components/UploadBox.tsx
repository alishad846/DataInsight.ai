import React, { useCallback, useState } from "react";
import { Upload, FileText, Database, BarChart3, X, Loader2 } from "lucide-react";
import API from "../api/api";

export interface FileData {
  id: string;            // datasetId
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: Date;
  preview?: any[];
}

interface UploadBoxProps {
  onFileUpload: (file: FileData) => void;
  recentFiles: FileData[];
  onFileSelect: (file: FileData) => void;
  onRemoveFile: (id: string) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({
  onFileUpload,
  recentFiles,
  onFileSelect,
  onRemoveFile,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "csv":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "xlsx":
      case "xls":
        return <Database className="w-5 h-5 text-blue-500" />;
      case "json":
        return <BarChart3 className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  /* =========================
     CORE BACKEND CONNECTION
     ========================= */
  const handleFile = async (file: File) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx?|json)$/i)
    ) {
      alert("Please upload only CSV, Excel, or JSON files");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);

      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const datasetId =
        res.data.datasetId ||
        res.data?.data?._id ||
        res.data?.data?.id;

      if (!datasetId) {
        throw new Error("datasetId not returned from backend");
      }

      // Try to fetch dataset details, but use upload response if fetch fails
      let filePath = res.data.path || res.data.data?.path || res.data.data?.filepath;

      try {
        // 🔥 fetch dataset details (path is required for analytics)
        const datasetRes = await API.get(`/datasets/${datasetId}`);
        filePath = datasetRes.data.data?.filepath ||
          datasetRes.data.data?.path ||
          filePath;
      } catch (fetchError: any) {
        console.warn("Could not fetch dataset details, using upload response:", fetchError?.message);
        // Continue with path from upload response
      }

      const uploadedFile: FileData = {
        id: datasetId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        path: filePath || "", // ✅ THIS UNBLOCKS DASHBOARD
        preview: [],
      };


      onFileUpload(uploadedFile);
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        "Upload failed. Please check the console for details.";
      alert(`Upload Error: ${errorMessage}`);
      console.error("Full error:", error?.response?.data || error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 backdrop-blur-md bg-white/10 ${dragActive
            ? "border-sky-500 bg-sky-50/20 scale-105"
            : "border-gray-300 hover:border-sky-400 hover:bg-white/20"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!isUploading && (
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".csv,.xlsx,.xls,.json"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        )}

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 ${dragActive ? "bg-sky-100/50 scale-110" : "bg-white/20"
              }`}
          >
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
            ) : (
              <Upload
                className={`w-12 h-12 ${dragActive ? "text-sky-600" : "text-gray-600"
                  }`}
              />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isUploading ? "Uploading Dataset..." : "Drop your dataset here"}
            </h3>
            {!isUploading && (
              <p className="text-gray-600 mb-4">
                or <span className="text-sky-600 font-medium">browse</span> to
                upload
              </p>
            )}
          </div>
        </div>
      </div>

      {recentFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Datasets
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="group relative backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-4 hover:bg-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => onFileSelect(file)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-100 hover:bg-red-200"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
                <div className="flex items-start space-x-3">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
