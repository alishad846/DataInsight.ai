export function isAllowedQuestion(question: string): boolean {

    const allowedKeywords = [
        "row",
        "rows",
        "column",
        "columns",
        "missing",
        "null",
        "correlation",
        "distribution",
        "mean",
        "median",
        "outlier",
        "dataset",
        "size",
        "duplicate"
    ];

    const q = question.toLowerCase();

    return allowedKeywords.some(keyword => q.includes(keyword));
}