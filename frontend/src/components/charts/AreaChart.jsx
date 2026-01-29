import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", potholes: 20 },
  { month: "Feb", potholes: 35 },
  { month: "Mar", potholes: 28 },
  { month: "Apr", potholes: 45 },
];

export default function RoadAreaChart() {
  return (
    <div className="bg-gray-800 p-5 rounded-xl h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Area dataKey="potholes" fill="#a855f7" stroke="#a855f7" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
