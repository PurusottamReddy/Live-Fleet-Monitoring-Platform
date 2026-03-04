function labelFor(a) {
  const high = a.speed > 100;
  if (a.event_type === "drowsiness") return `😴 Driver ${a.driver_id} drowsiness detected`;
  if (a.event_type === "phone_distraction") return `📱 Driver ${a.driver_id} phone distraction`;
  if (a.event_type === "harsh_braking") return `🛑 Driver ${a.driver_id} harsh braking (${a.speed} km/h)`;
  if (a.event_type === "speeding") return `${high ? "🚨 HIGH RISK:" : "🚗"} Driver ${a.driver_id} speeding (${a.speed} km/h)`;
  return `Driver ${a.driver_id} ${a.event_type} (${a.speed} km/h)`;
}

export default function Alerts({ alerts }) {
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="rounded-lg p-3 ring-1 ring-red-700 bg-red-900/25 shadow-sm"
        >
          <div className="text-red-400 font-medium">{labelFor(a)}</div>
          <div className="text-xs text-slate-300">
            Trip {a.trip_id} • {new Date(a.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}
