import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 p-6">
      <h1 className="text-xl font-bold text-purple-500 mb-10">
        RoadIntel
      </h1>

      <nav className="space-y-4">
        <Link to="/">Dashboard</Link>
        <Link to="/map">Map View</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/reports">Reports</Link>
      </nav>
    </div>
  );
}
