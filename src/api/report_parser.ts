export function findMissingColumn(report: any) {

    if (!report.missing_values) return null;

    let maxColumn = null;
    let maxValue = 0;

    for (const column in report.missing_values) {

        const value = report.missing_values[column];

        if (value > maxValue) {
            maxValue = value;
            maxColumn = column;
        }
    }

    return { column: maxColumn, value: maxValue };
}