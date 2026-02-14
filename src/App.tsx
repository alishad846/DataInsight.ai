import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import Navigation from "./components/Navigation";
import UploadBox from "./components/UploadBox";
import ChatInterface from "./components/ChatInterface";
import InsightCards from "./components/InsightCards";
import FloatingActions from "./components/FloatingActions";
import API from "./api/api";

interface FileData {
  id: string; // datasetId
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  preview?: any[];
}

function App() {
  const [currentView, setCurrentView] = useState("upload");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<FileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* =======================
     MAIN DATA → ML PIPELINE
     ======================= */
  const handleFileUpload = async (file: FileData) => {
    setRecentFiles((prev) => [file, ...prev.slice(0, 4)]);
    setSelectedDataset(file);
    setIsProcessing(true);

    try {
      // 1️⃣ Clean dataset
      await API.post(`/datasets/${file.id}/clean`);

      // 2️⃣ Train model
      await API.post(`/datasets/${file.id}/train`);

      // 3️⃣ Ready to chat
      setCurrentView("chat");
    } catch (error) {
      console.error("Processing failed:", error);
      alert(
        "Dataset uploaded, but cleaning or training failed. Check backend logs."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: FileData) => {
    setSelectedDataset(file);
    setCurrentView("chat");
  };

  const handleRemoveFile = (id: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedDataset?.id === id) setSelectedDataset(null);
  };

  /* =======================
     AUTH (DEMO ONLY)
     ======================= */
  const handleAuthSuccess = () => {
    localStorage.setItem("token", "demo-token");
    setIsAuthenticated(true);
  };

  const handleToggleAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentView("upload");
    setSelectedDataset(null);
    setRecentFiles([]);
  };

  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onToggleMode={handleToggleAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "upload":
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-sky-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome to DataInsight AI
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your dataset and let our AI assistant help you discover
                  insights.
                </p>
              </div>

              <UploadBox
                onFileUpload={handleFileUpload}
                recentFiles={recentFiles}
                onFileSelect={handleFileSelect}
                onRemoveFile={handleRemoveFile}
              />

              {isProcessing && (
                <div className="mt-4 text-center text-purple-600 font-medium animate-pulse">
                  AI is cleaning and training on your data. Please wait...
                </div>
              )}
            </div>
          </div>
        );

      case "chat":
        return <ChatInterface dataset={selectedDataset} />;

      case "dashboard":
        return (
          <div className="min-h-screen p-8">
            {selectedDataset ? (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  Dashboard: {selectedDataset.name}
                </h2>
                <InsightCards dataset={selectedDataset} />
              </>
            ) : (
              <div className="text-center">
                Please upload a dataset first.
              </div>
            )}
          </div>
        );

      case "datasets":
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Datasets</h2>
            <div className="grid gap-4">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-white/40 rounded-xl border border-white/50 flex justify-between items-center"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleFileSelect(file)}
                    className="text-purple-600 font-semibold"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-sky-50">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      {renderCurrentView()}
      <FloatingActions />
    </div>
  );
}

export default App;
