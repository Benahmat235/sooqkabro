import { useState, useEffect } from "react";
import { cities } from "@/data/cities";

const cityNameMap: Record<string, string> = {
  "n'djamena": "ndjamena",
  "ndjamena": "ndjamena",
  "n'djaména": "ndjamena",
  "moundou": "moundou",
  "sarh": "sarh",
  "abéché": "abeche",
  "abeche": "abeche",
  "kélo": "kelo",
  "kelo": "kelo",
  "koumra": "koumra",
  "pala": "pala",
  "am-timan": "amtiman",
  "am timan": "amtiman",
  "bongor": "bongor",
  "mongo": "mongo",
  "doba": "doba",
  "ati": "ati",
  "mao": "mao",
};

function matchCity(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (cityNameMap[lower]) return cityNameMap[lower];
  const found = cities.find((c) => c.name.toLowerCase() === lower);
  return found?.id || null;
}

export function useGeoLocation() {
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("http://ip-api.com/json/?fields=city", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.city) {
          setDetectedCity(matchCity(data.city));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { detectedCity, loading };
}
