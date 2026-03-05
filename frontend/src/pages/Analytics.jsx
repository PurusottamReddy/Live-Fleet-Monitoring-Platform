import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const backendURL = "http://localhost:4000";
const COLORS = ["#22d3ee", "#a3e635", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [series, setSeries] = useState([]);
  useEffect(() => {
    fetch(`${backendURL}/api/metrics/recent`)
      .then((r) => r.json())
      .then((rows) => {
        setEvents(rows);
      });
    const socket = io(backendURL);
    socket.on("new_driver_event", (evt) => {
      setEvents((prev) => [...prev, evt].slice(-500));
      setSeries((prev) => {
        const minute = new Date(evt.timestamp);
        const key = `${minute.getHours().toString().padStart(2, "0")}:${minute.getMinutes().toString().padStart(2, "0")}`;
        const map = new Map(prev.map((p) => [p.time, p.count]));
        const add = evt.event_type !== "normal" ? 1 : 0;
        map.set(key, (map.get(key) || 0) + add);
        const arr = Array.from(map.entries()).map(([time, count]) => ({ time, count }));
        arr.sort((a, b) => a.time.localeCompare(b.time));
        return arr.slice(-60);
      });
    });
    return () => socket.close();
  }, []);

  const dist = useMemo(() => {
    const types = ["speeding", "harsh_braking", "drowsiness", "phone_distraction"];
    const counts = Object.fromEntries(types.map((t) => [t, 0]));
    for (const e of events) {
      if (types.includes(e.event_type)) counts[e.event_type]++;
    }
    return types.map((t) => ({ name: t.replace("_", " "), value: counts[t] }));
  }, [events]);

  const topDrivers = useMemo(() => {
    const by = new Map();
    for (const e of events) {
      if (e.event_type === "normal") continue;
      by.set(e.driver_id, (by.get(e.driver_id) || 0) + 1);
    }
    const arr = Array.from(by.entries()).map(([driver, count]) => ({ driver, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [events]);

  const speedByType = useMemo(() => {
    const agg = new Map();
    for (const e of events) {
      const key = e.event_type;
      const v = agg.get(key) || { sum: 0, n: 0 };
      agg.set(key, { sum: v.sum + (e.speed || 0), n: v.n + 1 });
    }
    const arr = Array.from(agg.entries()).map(([type, { sum, n }]) => ({
      type: type.replace("_", " "),
      avg: n ? Math.round(sum / n) : 0,
    }));
    arr.sort((a, b) => b.avg - a.avg);
    return arr;
  }, [events]);

  const todayViolations = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate();
    return events.filter((e) => {
      if (e.event_type === "normal") return false;
      const dt = new Date(e.timestamp);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    }).length;
  }, [events]);

  const byHour = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: String(h).padStart(2, "0"), count: 0 }));
    for (const e of events) {
      if (e.event_type === "normal") continue;
      const h = new Date(e.timestamp).getHours();
      buckets[h].count += 1;
    }
    return buckets;
  }, [events]);

  const riskTrend = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const minute = new Date(e.timestamp);
      const key = `${minute.getHours().toString().padStart(2, "0")}:${minute.getMinutes().toString().padStart(2, "0")}`;
      const v = map.get(key) || { sum: 0, n: 0 };
      const score = Number.isFinite(e.risk_score) ? e.risk_score : 0;
      map.set(key, { sum: v.sum + score, n: v.n + 1 });
    }
    const arr = Array.from(map.entries()).map(([time, { sum, n }]) => ({ time, avg: n ? Math.round(sum / n) : 0 }));
    arr.sort((a, b) => a.time.localeCompare(b.time));
    return arr.slice(-60);
  }, [events]);

  const topTripsRisk = useMemo(() => {
    const agg = new Map();
    for (const e of events) {
      if (e.event_type === "normal") continue;
      const v = agg.get(e.trip_id) || 0;
      const score = Number.isFinite(e.risk_score) ? e.risk_score : 0;
      agg.set(e.trip_id, v + score);
    }
    const arr = Array.from(agg.entries()).map(([trip, total]) => ({ trip, total }));
    arr.sort((a, b) => b.total - a.total);
    return arr.slice(0, 5);
  }, [events]);

  const highSpeedRate = useMemo(() => {
    const n = events.length || 1;
    const hs = events.filter((e) => (e.speed || 0) > 100).length;
    return Math.round((hs / n) * 100);
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className="px-4 py-8 border-b border-slate-800">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 text-transparent bg-clip-text">
          Real-time Analytics
        </h2>
      </header>
      <main className="mx-auto max-w-7xl p-4 space-y-4">
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-4 shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Violations Today</div>
              <div className="text-xl text-cyan-300 tabular-nums">{todayViolations}</div>
            </div>
            <div className="rounded bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Top Event Type</div>
              <div className="text-xl text-cyan-300">
                {dist.slice().sort((a, b) => b.value - a.value)[0]?.name || "-"}
              </div>
            </div>
            <div className="rounded bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Most Active Driver</div>
              <div className="text-xl text-cyan-300 tabular-nums">
                {topDrivers[0]?.driver ?? "-"}
              </div>
            </div>
            <div className="rounded bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">Avg Speed (Max Type)</div>
              <div className="text-xl text-cyan-300 tabular-nums">
                {speedByType[0]?.avg ?? 0}
              </div>
            </div>
            <div className="rounded bg-slate-900/40 p-3">
              <div className="text-xs text-slate-400">High-Speed Rate (%)</div>
              <div className="text-xl text-cyan-300 tabular-nums">{highSpeedRate}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
            <div className="font-semibold mb-2 text-slate-200">Violations Distribution</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dist} dataKey="value" nameKey="name" outerRadius={90}>
                    {dist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
            <div className="font-semibold mb-2 text-slate-200">Top Drivers by Violations</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDrivers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="driver" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
            <div className="font-semibold mb-2 text-slate-200">Avg Speed by Event Type</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="type" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Bar dataKey="avg" fill="#a3e635" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
            <div className="font-semibold mb-2 text-slate-200">Violations by Hour</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow lg:col-span-2">
            <div className="font-semibold mb-2 text-slate-200">Risk Score Trend</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="avg" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
          <div className="font-semibold mb-2 text-slate-200">Top Risky Trips</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTripsRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="trip" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="total" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-3 shadow">
          <div className="font-semibold mb-2 text-slate-200">Recent Violations Per Minute</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
