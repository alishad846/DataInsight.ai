import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Insight {
  key: string;
  title: string;
  value: string;
  description: string;
}

interface InsightCardsProps {
  dataset: {
    insights: Insight[];
  };
}

const iconConfig: Record<string, any> = {
  trend: {
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  worst: {
    icon: <TrendingDown className="w-6 h-6" />,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  total: {
    icon: <DollarSign className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  average: {
    icon: <DollarSign className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  best: {
    icon: <Calendar className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  growth: {
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700'
  }
};

const InsightCards: React.FC<InsightCardsProps> = ({ dataset }) => {
  if (!dataset?.insights?.length) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {dataset.insights.map((insight, index) => {
        const config = iconConfig[insight.key];

        return (
          <div
            key={index}
            className="group relative backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 hover:bg-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg`}
              >
                {config.icon}
              </div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {insight.title}
              </h3>
              <div className="text-3xl font-bold text-gray-800">
                {insight.value}
              </div>
              <p className={`text-sm ${config.textColor} font-medium`}>
                {insight.description}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        );
      })}
    </div>
  );
};

export default InsightCards;
