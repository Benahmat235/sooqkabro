import { useState, useCallback } from "react";

const STORAGE_KEY = "tchadmarket_search_history";
const MAX_HISTORY = 8;

function getHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(getHistory);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
  }, [history]);

  const removeSearch = useCallback((query: string) => {
    const updated = history.filter((h) => h !== query);
    setHistory(updated);
    saveHistory(updated);
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addSearch, removeSearch, clearHistory };
}
