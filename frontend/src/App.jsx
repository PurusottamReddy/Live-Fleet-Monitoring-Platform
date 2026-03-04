import "./index.css";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    const onHash = () => setRoute(initial());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const Page = route === "dashboard" ? Dashboard
    : route === "about" ? About
    : route === "services" ? Services
    : route === "analytics" ? Analytics
    : route === "contact" ? Contact
    : Dashboard;
  return (
    <>
      <Navbar route={route} onNavigate={setRoute} />
      <Page />
    </>
  );
}
