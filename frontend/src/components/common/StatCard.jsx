export default function StatCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-5 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
