import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "sooq_recently_viewed";
const MAX_ITEMS = 12;

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

export function pushRecentlyViewed(id: string) {
  if (!id) return;
  const current = read();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX_ITEMS);
  write(next);
  // Notify same-tab subscribers
  window.dispatchEvent(new CustomEvent("sooq:recently-viewed"));
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => read());

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener("storage", sync);
    window.addEventListener("sooq:recently-viewed", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("sooq:recently-viewed", sync as EventListener);
    };
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
    window.dispatchEvent(new CustomEvent("sooq:recently-viewed"));
  }, []);

  return { ids, clear };
}
