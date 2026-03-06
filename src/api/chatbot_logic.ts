import { isAllowedQuestion } from "./allowed_questions";
import { findMissingColumn } from "./report_parser";

export function chatbotResponse(question: string, report: any) {

    const q = question.toLowerCase();

    // restrict chatbot
    if (!isAllowedQuestion(q)) {
        return "I can only answer questions related to the dataset report.";
    }

    // rows
    if (q.includes("rows")) {
        if (report.rows) {
            return `The dataset contains ${report.rows} rows.`;
        }
    }

    // columns
    if (q.includes("columns")) {
        if (report.columns) {
            return `The dataset contains ${report.columns} columns.`;
        }
    }

    // missing values
    if (q.includes("missing")) {

        const result = findMissingColumn(report);

        if (result) {
            return `Column ${result.column} has the highest missing values (${result.value}).`;
        }
    }

    // correlation
    if (q.includes("correlation")) {

        if (report.correlations) {

            const firstKey = Object.keys(report.correlations)[0];

            if (firstKey) {
                const value = report.correlations[firstKey];

                return `${firstKey.replace("_", " and ")} have correlation ${value}.`;
            }
        }
    }

    // mean
    if (q.includes("mean")) {

        if (report.statistics) {

            const column = Object.keys(report.statistics)[0];

            const value = report.statistics[column]?.mean;

            if (value) {
                return `Mean of ${column} is ${value}.`;
            }
        }
    }

    return "I don't know based on the current report.";
}