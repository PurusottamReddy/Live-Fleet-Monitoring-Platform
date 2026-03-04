export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <header className="px-4 py-8 border-b border-slate-800">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 text-transparent bg-clip-text">Contact Us</h2>
      </header>
      <main className="mx-auto max-w-7xl p-4 space-y-4">
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-6 shadow">
          <div className="text-slate-200 font-semibold mb-2">Get in touch</div>
          <div className="text-slate-400 text-sm">
            For partnerships or support, reach out via email or your preferred channel.
          </div>
        </section>
        <section className="rounded-xl bg-slate-800/80 ring-1 ring-slate-700 p-6 shadow">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="rounded bg-slate-900/40 p-3 ring-1 ring-slate-700 text-slate-200" placeholder="Your name" />
            <input className="rounded bg-slate-900/40 p-3 ring-1 ring-slate-700 text-slate-200" placeholder="Email" />
            <input className="md:col-span-2 rounded bg-slate-900/40 p-3 ring-1 ring-slate-700 text-slate-200" placeholder="Subject" />
            <textarea className="md:col-span-2 rounded bg-slate-900/40 p-3 ring-1 ring-slate-700 text-slate-200 h-32" placeholder="Message" />
            <div className="md:col-span-2">
              <button type="button" className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white">Send</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
