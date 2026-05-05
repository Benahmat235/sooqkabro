import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cleanup any previously-registered service workers (vite-plugin-pwa removed)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
