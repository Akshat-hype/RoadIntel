import StatCard from "../components/common/StatCard";
import SeverityChart from "../components/charts/SeverityChart";
import RoadAreaChart from "../components/charts/AreaChart";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Potholes" value="1,245" />
        <StatCard title="High Severity" value="87" />
        <StatCard title="Roads Monitored" value="52" />
        <StatCard title="Reports Generated" value="134" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SeverityChart />
        <RoadAreaChart />
      </div>
    </div>
  );
}
