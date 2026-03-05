import "./index.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Services from "./pages/Services";
import Analytics from "./pages/Analytics";

import Contact from "./pages/Contact";

export default function App() {
  const initial = () => {
    const h = window.location.hash.replace(/^#\/?/, "");
    return h || "dashboard";
  };
  const [route, setRoute] = useState(initial());
  const [backendURL, setBackendURL] = useState("http://localhost:4000");
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [epm, setEpm] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  async function resolveBackend() {
    const ports = [4000, 4001];
    for (const p of ports) {
      try {
        const res = await fetch(`http://localhost:${p}/`);
        if (res.ok) return `http://localhost:${p}`;
      } catch (e) { void e; }
    }
    return "http://localhost:4000";
  }

  useEffect(() => {
    const onHash = () => setRoute(initial());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    resolveBackend().then(setBackendURL);
  }, []);

  useEffect(() => {
    if (!backendURL) return;
    fetch(`${backendURL}/api/metrics/recent`)
      .then((r) => r.json())
      .then((rows) => {
        setEvents(rows);
      });
    const socket = io(backendURL);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("status", () => setConnected(true));
    socket.on("new_driver_event", (evt) => {
      const now = Date.now();
      const t =
        typeof evt.timestamp === "string"
          ? new Date(evt.timestamp).getTime()
          : typeof evt.timestamp === "number"
          ? evt.timestamp
          : now;
      setLastEvent(t);
      setEvents((prev) => {
        const next = [...prev, evt].slice(-500);
        const count = next.filter(
          (e) =>
            e.event_type !== "normal" &&
            (now -
              (typeof e.timestamp === "string"
                ? new Date(e.timestamp).getTime()
                : typeof e.timestamp === "number"
                ? e.timestamp
                : now)) < 60000
        ).length;
        setEpm(count);
        return next;
      });
      if (evt.event_type !== "normal") {
        setAlerts((prev) => [evt, ...prev].slice(0, 10));
      }
    });
    return () => socket.close();
  }, [backendURL]);

  const Page = route === "dashboard" ? Dashboard
    : route === "about" ? About
    : route === "services" ? Services
    : route === "analytics" ? Analytics
    : route === "contact" ? Contact
    : Dashboard;
  return (
    <>
      <Navbar route={route} onNavigate={setRoute} />
      {route === "dashboard" && <Dashboard events={events} alerts={alerts} connected={connected} epm={epm} lastEvent={lastEvent} />}
      {route === "analytics" && <Analytics events={events} />}
      {route === "about" && <About />}
      {route === "services" && <Services />}
      {route === "contact" && <Contact />}
    </>
  );
}
