import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DataGraph = ({ data }) => {

    return (
        <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" />
        </LineChart>
    );
};

export default DataGraph;