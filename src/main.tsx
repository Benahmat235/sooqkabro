import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[v0] Application starting...");

createRoot(document.getElementById("root")!).render(<App />);

console.log("[v0] Application rendered");
