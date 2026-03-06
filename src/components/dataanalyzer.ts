export interface ColumnInfo {
    name: string;
    isNumeric: boolean;
    isID: boolean;
    missingCount: number;
    uniqueCount: number;
}

export interface AnalysisResult {
    columns: ColumnInfo[];
    suggestedIgnored: string[];
    hasMissing: boolean;
    suggestedTask: "Regression" | "Classification" | "Unknown";
    qualityScore: number;
}

export function analyzeData(
    data: any[],
    headers: string[],
    targetColumn: string,
    summary: string
): AnalysisResult {

    const columns: ColumnInfo[] = headers.map((header) => {
        const values = data.map((row) => row[header]);

        const missingCount = values.filter(
            (v) => v === "" || v === null || v === undefined
        ).length;

        const numericCount = values.filter(
            (v) => !isNaN(parseFloat(v))
        ).length;

        const uniqueCount = new Set(values).size;

        const isID =
            header.toLowerCase().includes("id") ||
            header.toLowerCase().includes("uuid") ||
            header.toLowerCase().includes("serial") ||
            uniqueCount === data.length;

        return {
            name: header,
            isNumeric: numericCount / values.length > 0.8,
            isID,
            missingCount,
            uniqueCount,
        };
    });

    const suggestedIgnored = columns
        .filter((col) => col.isID)
        .map((col) => col.name);

    const hasMissing = columns.some((col) => col.missingCount > 0);

    /* ===== ML TASK SUGGESTION ===== */

    let suggestedTask: "Regression" | "Classification" | "Unknown" = "Unknown";

    const target = columns.find((c) => c.name === targetColumn);

    if (target) {
        if (target.isNumeric) suggestedTask = "Regression";
        else if (target.uniqueCount < 15) suggestedTask = "Classification";
    }

    /* ===== QUALITY SCORE ===== */

    let score = 0;

    if (targetColumn) score += 20;
    if (!hasMissing) score += 20;
    if (summary.length > 10) score += 15;
    if (suggestedIgnored.length > 0) score += 15;
    if (columns.length > 5) score += 15;
    score += 15; // valid CSV baseline

    return {
        columns,
        suggestedIgnored,
        hasMissing,
        suggestedTask,
        qualityScore: score,
    };
}