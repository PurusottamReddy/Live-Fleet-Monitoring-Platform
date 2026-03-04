export default function Services() {
  const services = [
    { title: "Smart Dashcam", points: ["Works offline", "Front/back camera", "Future: external Wi‑Fi camera"] },
    { title: "okDriver Assistant", points: ["Voice co‑pilot", "Wake word trigger", "Nearby fuel and services"] },
    { title: "Driver Monitoring", points: ["Detects drowsiness", "Phone distraction", "Real-time alerts"] },
    { title: "Emergency SOS", points: ["Auto SOS on incidents", "Notify contacts", "Faster response"] },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className="px-4 py-8 border-b border-slate-800">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 text-transparent bg-clip-text">Powerful Features for Safer Driving</h2>
      </header>
      <main className="mx-auto max-w-7xl p-4 space-y-4">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-5 shadow hover:shadow-lg transition">
              <div className="text-slate-200 font-semibold mb-2">{s.title}</div>
              <ul className="text-slate-400 text-sm space-y-2">
                {s.points.map((p, i) => <li key={i}>• {p}</li>)}
              </ul>
              <div className="mt-3">
                <button className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs">See Demo</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
