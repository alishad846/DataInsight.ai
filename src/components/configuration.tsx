interface Props {
    category: string;
    targetColumn: string;
    summary: string;
    ignoredColumns: string[];
    hasMissing: boolean;
    score: number;
}

const ConfigurationSummary: React.FC<Props> = ({
    category,
    targetColumn,
    summary,
    ignoredColumns,
    hasMissing,
    score,
}) => {

    const Item = ({
        label,
        value,
        valid,
    }: {
        label: string;
        value: string;
        valid: boolean;
    }) => (
        <div className="flex justify-between items-center py-2 border-b last:border-none">
            <span className="text-sm">{label}</span>
            <span
                className={`text-sm font-medium ${valid ? "text-green-600" : "text-red-500"
                    }`}
            >
                {value}
            </span>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">

            <h3 className="text-lg font-semibold">
                Configuration Summary
            </h3>

            <div className="space-y-2">

                <Item
                    label="Type"
                    value={category}
                    valid={true}
                />

                <Item
                    label="Target"
                    value={targetColumn || "Not Selected"}
                    valid={!!targetColumn}
                />

                <Item
                    label="Summary"
                    value={
                        summary.length >= 5 ? "Provided" : "Too Short"
                    }
                    valid={summary.length >= 5}
                />

                <Item
                    label="Ignored Columns"
                    value={
                        ignoredColumns.length > 0
                            ? ignoredColumns.length + " detected"
                            : "None"
                    }
                    valid={true}
                />

                <Item
                    label="Missing Values"
                    value={hasMissing ? "Yes" : "No"}
                    valid={!hasMissing}
                />

                <Item
                    label="Quality Score"
                    value={`${score}/100`}
                    valid={score >= 60}
                />
            </div>
        </div>
    );
};

export default ConfigurationSummary;