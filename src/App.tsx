import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import UploadBox from "./components/UploadBox";
import Navigation from "./components/Navigation";
import FloatingActions from "./components/FloatingActions";

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  category: "SALES" | "HOSPITALIZED" | "BUSINESS";
}

function App() {
  /* ================= STATE ================= */

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const [currentView, setCurrentView] = useState<
    "upload" | "dashboard" | "datasets"
  >("upload");

  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [selectedDataset, setSelectedDataset] =
    useState<FileData | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "segmentation" | "insights" | "reports"
  >("overview");

  /* ================= AUTH ================= */

  const handleAuthSuccess = () => {
    localStorage.setItem("token", "demo-token");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setSelectedDataset(null);
    setRecentFiles([]);
    setCurrentView("upload");
  };

  const handleToggleAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  /* ================= FILE HANDLING ================= */

  const handleFileUpload = (file: FileData) => {
    setRecentFiles((prev) => [file, ...prev]);
    setSelectedDataset(file);
    setCurrentView("dashboard");
    setActiveTab("overview");
  };

  const handleFileSelect = (file: FileData) => {
    setSelectedDataset(file);
    setCurrentView("dashboard");
    setActiveTab("overview");
  };

  const handleRemoveFile = (id: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedDataset?.id === id) {
      setSelectedDataset(null);
    }
  };

  /* ================= UPLOAD PAGE ================= */

  const renderUploadPage = () => (
    <div className="p-8 max-w-7xl mx-auto">
      <UploadBox
        onFileUpload={handleFileUpload}
        recentFiles={recentFiles}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );

  /* ================= DATASETS PAGE ================= */

  const renderDatasetsPage = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-gray-800">
            Your Datasets
          </h2>

          <button
            onClick={() => setCurrentView("upload")}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg"
          >
            + Upload New
          </button>
        </div>

        {recentFiles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white p-6 rounded-xl border shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {file.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Category: {file.category}
                </p>

                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>

                <p className="text-sm text-gray-500 mb-4">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() => handleFileSelect(file)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl border text-center">
            <p className="text-gray-500">
              No datasets uploaded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  /* ================= DASHBOARD PAGE ================= */

  const renderDashboardPage = () => {
    const isSales = selectedDataset?.category === "SALES";

    return (
      <div
        className="min-h-screen relative"
        style={
          isSales
            ? {
              backgroundImage:
                "url('https://i.pinimg.com/736x/9c/09/69/9c0969fc842d5aea7df5c3c4bef18375.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : {}
        }
      >
        {/* Overlay only for SALES */}
        {isSales && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
        )}

        <div className="relative z-10">

          {/* CONTEXT BAR */}
          <div className="bg-white/95 border-b px-10 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Enterprise Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDataset
                    ? `Dataset: ${selectedDataset.name}`
                    : "No dataset selected"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex">

            {/* SIDEBAR */}
            <div className="w-72 bg-white/95 border-r min-h-screen p-6 space-y-3">
              <h3 className="text-gray-700 font-semibold mb-4">
                Dashboard Sections
              </h3>

              {["overview", "trends", "segmentation", "insights", "reports"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg capitalize text-sm font-medium transition ${activeTab === tab
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-10 space-y-10">

              {!selectedDataset ? (
                <div className="bg-white p-12 rounded-xl border text-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    No Dataset Selected
                  </h2>
                  <button
                    onClick={() => setCurrentView("upload")}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg"
                  >
                    Upload Dataset
                  </button>
                </div>
              ) : (
                <>
                  {/* KPI ROW */}
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { title: "Total Revenue", value: "$84,200" },
                      { title: "Net Profit", value: "$23,400" },
                      { title: "Growth Rate", value: "12.4%" },
                      { title: "Active Clients", value: "892" },
                    ].map((kpi) => (
                      <div
                        key={kpi.title}
                        className="bg-white/95 p-6 rounded-xl border shadow-sm"
                      >
                        <p className="text-sm text-gray-500">
                          {kpi.title}
                        </p>
                        <h3 className="text-2xl font-semibold text-gray-900 mt-2">
                          {kpi.value}
                        </h3>
                      </div>
                    ))}
                  </div>

                  {/* TAB CONTENT */}
                  <div className="bg-white/95 p-8 rounded-xl border shadow-sm h-96 flex items-center justify-center text-gray-400">
                    {activeTab.charAt(0).toUpperCase() +
                      activeTab.slice(1)}{" "}
                    Section Content Area
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= AUTH CHECK ================= */

  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onToggleMode={handleToggleAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  /* ================= MAIN APP ================= */

  return (
    <div className="min-h-screen">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {currentView === "upload" && renderUploadPage()}
      {currentView === "dashboard" && renderDashboardPage()}
      {currentView === "datasets" && renderDatasetsPage()}

      <FloatingActions />
    </div>
  );
}

export default App;