import RiskBadge from "./RiskBadge";

export default function DriverTable({ rows }) {
  return (
    <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-4 shadow">
      <div className="font-semibold mb-2 text-slate-200">Driver Table</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="text-left p-2">Driver ID</th>
              <th className="text-left p-2">Trip ID</th>
              <th className="text-left p-2">Event Type</th>
              <th className="text-left p-2">Speed</th>
              <th className="text-left p-2">Risk Level</th>
              <th className="text-left p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-2">{r.driver_id}</td>
                <td className="p-2">{r.trip_id}</td>
                <td className="p-2">{r.event_type}</td>
                <td className="p-2">{r.speed}</td>
                <td className="p-2">
                  <RiskBadge level={r.risk_level || "Safe"} />
                </td>
                <td className="p-2">
                  {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
