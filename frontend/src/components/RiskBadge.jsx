export default function RiskBadge({ level }) {
  const map = {
    Safe: "bg-green-700 text-green-200",
    Warning: "bg-yellow-700 text-yellow-200",
    High: "bg-red-700 text-red-200",
  };
  return <span className={`px-2 py-1 rounded ${map[level] || map.Safe}`}>{level}</span>;
}
