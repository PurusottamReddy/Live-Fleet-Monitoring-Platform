export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className="px-4 py-8 border-b border-slate-800">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 text-transparent bg-clip-text">
          About okDriver
        </h2>
      </header>
      <main className="mx-auto max-w-7xl p-4 space-y-4">
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-6 shadow">
          <p className="text-slate-300 leading-relaxed">
            okDriver builds AI-powered safety features tailored for Indian roads, including fatigue detection,
            phone distraction alerts, emergency SOS, and an intelligent dashcam experience.
          </p>
        </section>
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-6 shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded bg-slate-900/40 p-4 ring-1 ring-slate-700">
              <div className="text-slate-200 font-semibold mb-1">AI-Powered Safety</div>
              <div className="text-slate-400 text-sm">Drowsiness and distraction monitoring with instant alerts.</div>
            </div>
            <div className="rounded bg-slate-900/40 p-4 ring-1 ring-slate-700">
              <div className="text-slate-200 font-semibold mb-1">Dashcam</div>
              <div className="text-slate-400 text-sm">Turns smartphones into smart dashcams with offline mode.</div>
            </div>
            <div className="rounded bg-slate-900/40 p-4 ring-1 ring-slate-700">
              <div className="text-slate-200 font-semibold mb-1">Emergency SOS</div>
              <div className="text-slate-400 text-sm">Automated alerts to contacts when risk is detected.</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
