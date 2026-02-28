import React from "react";

interface Props {
    score: number;
    task: string;
}

const QualityScore: React.FC<Props> = ({ score, task }) => {
    const radius = 65;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = Math.min(Math.max(score, 0), 100);
    const strokeDashoffset =
        circumference - (progress / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return "#16a34a"; // green
        if (score >= 60) return "#2563eb"; // blue
        if (score >= 40) return "#f59e0b"; // yellow
        return "#dc2626"; // red
    };

    const getLabel = () => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Moderate";
        return "Needs Attention";
    };

    const getConfidence = () => {
        if (score >= 80) return "High";
        if (score >= 60) return "Medium";
        return "Low";
    };

    return (
        <div className="bg-white p-8 rounded-2xl border shadow-sm flex flex-col items-center space-y-6">

            <h3 className="text-lg font-semibold text-gray-800">
                Data Readiness Score
            </h3>

            {/* Circular Progress */}
            <div className="relative w-44 h-44">

                <svg height="180" width="180">
                    {/* Background Circle */}
                    <circle
                        stroke="#e5e7eb"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx="90"
                        cy="90"
                    />

                    {/* Progress Circle */}
                    <circle
                        stroke={getColor()}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: "stroke-dashoffset 0.9s ease",
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                        }}
                        r={normalizedRadius}
                        cx="90"
                        cy="90"
                    />
                </svg>

                {/* Score Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-3xl font-bold"
                        style={{ color: getColor() }}
                    >
                        {progress}
                    </span>
                    <span className="text-xs text-gray-500">/100</span>
                </div>
            </div>

            {/* Status */}
            <div className="text-center">
                <p className="text-sm text-gray-500">
                    Status
                </p>
                <p
                    className="font-semibold"
                    style={{ color: getColor() }}
                >
                    {getLabel()}
                </p>
            </div>

            {/* Suggested Task */}
            <div className="w-full border-t pt-4 text-center space-y-2">
                <p className="text-sm font-medium text-gray-600">
                    Suggested ML Task
                </p>
                <p className="text-blue-600 font-semibold text-lg">
                    {task}
                </p>

                <p className="text-xs text-gray-500">
                    Confidence:{" "}
                    <span className="font-medium">
                        {getConfidence()}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default QualityScore;