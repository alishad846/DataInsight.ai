interface Props {
    data: any[];
}

const DataPreview: React.FC<Props> = ({ data }) => {
    if (!data.length) return null;

    const headers = Object.keys(data[0]);

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm overflow-auto max-h-64">
            <h3 className="font-semibold mb-4">
                Data Preview (Top 10 Rows)
            </h3>

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="border p-2 text-left">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.slice(0, 10).map((row, idx) => (
                        <tr key={idx}>
                            {headers.map((header) => (
                                <td key={header} className="border p-2">
                                    {row[header] || (
                                        <span className="text-red-500">Missing</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataPreview;