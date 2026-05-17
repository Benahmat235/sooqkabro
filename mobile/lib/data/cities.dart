class CityData {
  const CityData({required this.id, required this.name, this.quartiers = const []});
  final String id;
  final String name;
  final List<String> quartiers;
}

const cities = <CityData>[
  CityData(
    id: 'ndjamena',
    name: "N'Djaména",
    quartiers: [
      'Moursal', 'Chagoua', 'Dembé', 'Farcha', 'Diguel',
      'Amriguébé', 'Ardep Djoumal', 'Bololo', 'Djambal Bahr',
      'Gardolé', 'Habena', 'Klémat', 'Mardjandafack',
      'Ndjari', 'Paris-Congo', 'Sabangali', 'Ridina',
      'Amtoukoui', 'Gassi', 'Nguéli',
    ],
  ),
  CityData(id: 'moundou', name: 'Moundou'),
  CityData(id: 'sarh', name: 'Sarh'),
  CityData(id: 'abeche', name: 'Abéché'),
  CityData(id: 'kelo', name: 'Kélo'),
  CityData(id: 'koumra', name: 'Koumra'),
  CityData(id: 'pala', name: 'Pala'),
  CityData(id: 'amtiman', name: 'Am-Timan'),
  CityData(id: 'bongor', name: 'Bongor'),
  CityData(id: 'mongo', name: 'Mongo'),
  CityData(id: 'doba', name: 'Doba'),
  CityData(id: 'ati', name: 'Ati'),
  CityData(id: 'mao', name: 'Mao'),
];

CityData? getCityById(String id) {
  for (final c in cities) {
    if (c.id == id) return c;
  }
  return null;
}
