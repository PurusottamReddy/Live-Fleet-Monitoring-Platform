import { useState } from "react";

export default function Navbar({ route, onNavigate }) {
  const links = [
    { key: "dashboard", label: "HOME" },
    { key: "about", label: "ABOUT US" },
    { key: "services", label: "SERVICES" },
    { key: "analytics", label: "ANALYTICS" },
    { key: "contact", label: "CONTACT US" },
  ];
  const go = (key) => {
    const hash = `#/${key}`;
    window.history.pushState(null, "", hash);
    onNavigate?.(key);
  };
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 ring-1 ring-slate-700 text-cyan-300 font-bold">ok</span>
          <span className="text-slate-200 font-semibold">okDriver</span>
        </div>
        <button className="md:hidden px-2 py-1 rounded bg-slate-800 text-slate-200 ring-1 ring-slate-700" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
        <div className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => go(l.key)}
              className={`px-3 py-1 rounded transition ${
                route === l.key ? "bg-slate-800 text-cyan-300 ring-1 ring-slate-700" : "text-slate-300 hover:text-cyan-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div>
          <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-sm hover:bg-white">Login</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-800 px-4 pb-3">
          <div className="flex flex-col gap-2 mt-2">
            {links.map((l) => (
              <button
                key={l.key}
                onClick={() => { setOpen(false); go(l.key); }}
                className={`w-full text-left px-3 py-2 rounded ${
                  route === l.key ? "bg-slate-800 text-cyan-300 ring-1 ring-slate-700" : "text-slate-300 hover:text-cyan-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
