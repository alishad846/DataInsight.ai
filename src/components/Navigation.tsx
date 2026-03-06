import React from "react";
import { LayoutDashboard, Upload, Database, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: "upload" | "dashboard" | "datasets") => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  onLogout,
}) => {
  const navItems = [
    {
      key: "upload",
      label: "Upload",
      icon: <Upload size={18} />,
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      key: "datasets",
      label: "Datasets",
      icon: <Database size={18} />,
    },
  ];

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div
          className="text-xl font-bold text-purple-600 cursor-pointer"
          onClick={() => onViewChange("upload")}
        >
          DataInsight AI
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">

          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() =>
                onViewChange(item.key as "upload" | "dashboard" | "datasets")
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium
                ${currentView === item.key
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;