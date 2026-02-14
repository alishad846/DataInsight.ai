import React from 'react';
import { Home, MessageCircle, BarChart3, Database, LogOut, User } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onLogout }) => {
  const navItems = [
    { id: 'upload', label: 'Upload', icon: <Home className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat Insights', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'datasets', label: 'Datasets', icon: <Database className="w-5 h-5" /> }
  ];

  return (
    <nav className="backdrop-blur-md bg-white/20 border-b border-white/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-sky-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">DataInsight AI</h1>
              <p className="text-xs text-gray-600">Smart Analytics Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-sky-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/30 hover:text-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            
            {/* User menu */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-2 px-3 py-2 backdrop-blur-md bg-white/20 rounded-xl border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-sky-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <select
              value={currentView}
              onChange={(e) => onViewChange(e.target.value)}
              className="px-3 py-2 rounded-xl backdrop-blur-md bg-white/30 border border-white/30 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/20 border-t border-white/30 z-50">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex-1 flex flex-col items-center space-y-1 py-3 transition-all duration-200 ${
                currentView === item.id
                  ? 'text-purple-600'
                  : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;