export interface City {
  id: string;
  name: string;
  quartiers?: string[];
}

export const cities: City[] = [
  {
    id: "ndjamena",
    name: "N'Djaména",
    quartiers: [
      "Moursal", "Chagoua", "Dembé", "Farcha", "Diguel",
      "Amriguébé", "Ardep Djoumal", "Bololo", "Djambal Bahr",
      "Gardolé", "Habena", "Klémat", "Mardjandafack",
      "Ndjari", "Paris-Congo", "Sabangali", "Ridina",
      "Amtoukoui", "Gassi", "Nguéli"
    ],
  },
  { id: "moundou", name: "Moundou" },
  { id: "sarh", name: "Sarh" },
  { id: "abeche", name: "Abéché" },
  { id: "kelo", name: "Kélo" },
  { id: "koumra", name: "Koumra" },
  { id: "pala", name: "Pala" },
  { id: "amtiman", name: "Am-Timan" },
  { id: "bongor", name: "Bongor" },
  { id: "mongo", name: "Mongo" },
  { id: "doba", name: "Doba" },
  { id: "ati", name: "Ati" },
  { id: "mao", name: "Mao" },
];

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}
