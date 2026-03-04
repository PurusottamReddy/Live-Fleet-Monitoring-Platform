export default function MetricCard({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
      <div className="text-slate-300 text-sm">{title}</div>
      <div className="text-cyan-300 text-3xl font-semibold mt-2 tabular-nums">{value}</div>
    </div>
  );
}
