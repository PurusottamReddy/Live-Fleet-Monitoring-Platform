export default function SystemStatus({ status, epm, activeDrivers, violationsToday, lastEvent }) {
  return (
    <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-4 shadow space-y-2">
      <div className="font-semibold text-slate-200">System Status</div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            status ? "bg-green-400" : "bg-red-500"
          }`}
        ></span>
        <span>{status ? "Connected to Event Stream" : "Disconnected"}</span>
      </div>
      <div className="text-sm text-slate-300">Events/min: <span className="tabular-nums">{epm}</span></div>
      <div className="text-sm text-slate-300">Active drivers: <span className="tabular-nums">{activeDrivers}</span></div>
      <div className="text-sm text-slate-300">Violations Today: <span className="tabular-nums">{violationsToday ?? 0}</span></div>
      <div className="text-sm text-slate-300">
        Last event: {lastEvent ? new Date(lastEvent).toLocaleTimeString() : "-"}
      </div>
    </div>
  );
}
