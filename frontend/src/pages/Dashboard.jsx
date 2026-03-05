import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "../components/MetricCard";
import SystemStatus from "../components/SystemStatus";
import Alerts from "../components/Alerts";
import DriverTable from "../components/DriverTable";

export default function Dashboard({ events, alerts, connected, epm, lastEvent }) {

  const driverStatusSummary = useMemo(() => {
    const warnTypes = new Set(["drowsiness", "phone_distraction", "harsh_braking"]);
    const byDriver = new Map();
    for (const e of events) {
      const high = e.speed > 100;
      const warn = e.speed > 80 || warnTypes.has(e.event_type);
      const violation = e.event_type !== "normal" || e.speed > 80;
      const d = byDriver.get(e.driver_id) || { high: false, warn: false, trips: new Map() };
      d.high = d.high || high;
      d.warn = d.warn || warn;
      if (violation) {
        const c = (d.trips.get(e.trip_id) || 0) + 1;
        d.trips.set(e.trip_id, c);
      }
      byDriver.set(e.driver_id, d);
    }
    let safe = 0, warning = 0, high = 0;
    for (const d of byDriver.values()) {
      const anyHighTrip = Array.from(d.trips.values()).some((c) => c >= 3);
      if (anyHighTrip || d.high) high++;
      else if (d.warn) warning++;
      else safe++;
    }
    return { safe, warning, high };
  }, [events]);

  const series = useMemo(() => {
    const map = new Map();
    for (const evt of events) {
      const minute = new Date(evt.timestamp);
      const key = `${minute.getHours().toString().padStart(2, "0")}:${minute.getMinutes().toString().padStart(2, "0")}`;
      const add = evt.event_type !== "normal" ? 1 : 0;
      map.set(key, (map.get(key) || 0) + add);
    }
    const arr = Array.from(map.entries()).map(([time, violations]) => ({ time, violations }));
    arr.sort((a, b) => a.time.localeCompare(b.time));
    return arr.slice(-60);
  }, [events]);

  const dist = useMemo(() => {
    const counts = { speeding: 0, harsh_braking: 0, drowsiness: 0, phone_distraction: 0 };
    for (const evt of events) {
      if (counts[evt.event_type] !== undefined) counts[evt.event_type] += 1;
    }
    return [
      { type: "speeding", count: counts.speeding },
      { type: "harsh_braking", count: counts.harsh_braking },
      { type: "drowsiness", count: counts.drowsiness },
      { type: "phone_distraction", count: counts.phone_distraction },
    ];
  }, [events]);

  

  const driverRows = useMemo(() => {
    const rows = events.map((e) => {
      const ts =
        typeof e.timestamp === "string"
          ? new Date(e.timestamp).getTime()
          : typeof e.timestamp === "number"
          ? e.timestamp
          : typeof e.id === "number"
          ? e.id
          : 0;
      return {
        id: e.id,
        driver_id: e.driver_id,
        trip_id: e.trip_id,
        event_type: e.event_type,
        speed: e.speed,
        risk_level:
          e.speed > 100
            ? "High"
            : e.speed > 80 || ["drowsiness", "phone_distraction", "harsh_braking"].includes(e.event_type)
            ? "Warning"
            : "Safe",
        timestamp: ts,
      };
    });
    rows.sort((a, b) => b.timestamp - a.timestamp);
    return rows.slice(0, 15);
  }, [events]);

  const derivedMetrics = useMemo(() => {
    const trips = new Set(events.map((e) => e.trip_id)).size;
    const drivers = new Set(events.map((e) => e.driver_id)).size;
    const violations = events.filter((e) => e.event_type !== "normal").length;
    const avgRisk =
      events.length
        ? Math.round(
            events.reduce((sum, e) => {
              const score = Number.isFinite(e.risk_score)
                ? e.risk_score
                : e.speed > 100
                ? 20
                : e.speed > 80 || ["drowsiness","phone_distraction","harsh_braking"].includes(e.event_type)
                ? 10
                : 0;
              return sum + score;
            }, 0) / events.length
          )
        : 0;
    return { trips, drivers, violations, avgRisk };
  }, [events]);

  const violationsTodayLocal = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    return events.filter((e) => {
      if (e.event_type === "normal") return false;
      const t = new Date(e.timestamp);
      return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
    }).length;
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className=" top-0 z-10 backdrop-blur bg-slate-900/70 px-4 py-4 border-b border-slate-800 shadow-md flex items-center justify-center">
        <h1 className="text-2xl md:text-4xl font-extrabold capitilize tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 text-transparent bg-clip-text drop-shadow">
          Fleet Monitoring Dashboard
        </h1>
      </header>

      <main className="mx-auto max-w-7xl p-4 space-y-4">
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
          <div className="font-semibold mb-2 text-slate-200">Fleet Overview</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricCard title="Total Trips" value={derivedMetrics.trips} />
            <MetricCard title="Active Drivers" value={derivedMetrics.drivers} />
            <MetricCard title="Total Violations" value={derivedMetrics.violations} />
            <MetricCard title="Risk Score" value={derivedMetrics.avgRisk} />
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
              <div className="font-semibold mb-2 text-slate-200">Live Dashcam</div>
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full rounded"
                  src="https://www.youtube.com/embed/8ZvszQog-EE?autoplay=1&mute=1&enablejsapi=1"
                  title="Dashcam"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            </div>
            <SystemStatus
              status={connected}
              epm={epm}
              activeDrivers={derivedMetrics.drivers}
              violationsToday={violationsTodayLocal}
              lastEvent={lastEvent}
            />
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
              <div className="font-semibold mb-2 text-slate-200">Alerts</div>
              <div className="h-104 overflow-y-auto overflow-x-hidden no-scrollbar">
                <Alerts alerts={alerts} />
              </div>
            </div>
            <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
              <div className="font-semibold mb-2 text-slate-200">Driver Status Summary</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-green-900/30 p-2">
                  <div className="text-xs text-green-300">Safe</div>
                  <div className="text-xl text-green-300 tabular-nums">{driverStatusSummary.safe || 0}</div>
                </div>
                <div className="rounded bg-yellow-900/30 p-2">
                  <div className="text-xs text-yellow-300">Warning</div>
                  <div className="text-xl text-yellow-300 tabular-nums">{driverStatusSummary.warning || 0}</div>
                </div>
                <div className="rounded bg-red-900/30 p-2">
                  <div className="text-xs text-red-300">High</div>
                  <div className="text-xl text-red-300 tabular-nums">{driverStatusSummary.high || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow lg:col-span-2">
            <div className="font-semibold mb-2 text-slate-200">Violations Over Time</div>
            <div className="h-77">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <defs>
                    <linearGradient id="fillViolationsB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="violations" stroke="#22d3ee" fill="url(#fillViolationsB)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow lg:col-span-2">
            <div className="font-semibold mb-2 text-slate-200">Event Distribution</div>
            <div className="h-79">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="type"
                    stroke="#64748b"
                    interval="preserveStartEnd"
                    tickMargin={10}
                    tickFormatter={(t) => t.replace("_", " ")}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <DriverTable rows={driverRows} />
      </main>
      <footer className="px-4 py-3 text-xs text-slate-400">
        © {new Date().getFullYear()} Fleet Monitoring Prototype
      </footer>
    </div>
  );
}
