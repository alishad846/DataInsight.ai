import React, { useState } from 'react';
import { BarChart3, Download, Share2, Settings, ChevronUp, ChevronDown } from 'lucide-react';

const FloatingActions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Show Graph', color: 'from-purple-500 to-purple-600' },
    { icon: <Download className="w-5 h-5" />, label: 'Download', color: 'from-sky-500 to-sky-600' },
    { icon: <Share2 className="w-5 h-5" />, label: 'Share', color: 'from-green-500 to-green-600' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', color: 'from-gray-500 to-gray-600' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div className={`space-y-3 mb-4 transform transition-all duration-300 ${
        isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex items-center space-x-3 px-4 py-3 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200 backdrop-blur-md`}
            style={{
              transitionDelay: `${index * 50}ms`
            }}
          >
            {action.icon}
            <span className="font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-sky-500 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-md"
      >
        {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingActions;