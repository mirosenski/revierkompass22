# Erweiterte Mock-Daten für Performance-Tests

## Übersicht

Die erweiterten Mock-Daten (`mockDataLarge.ts`) bieten realistische deutsche Polizeidaten für umfassende Performance-Tests der Wizard-Komponenten. Diese Daten simulieren echte Produktionsumgebungen mit großen Datensätzen.

## Features

### 🏢 Realistische Präsidien-Daten
- **18 deutsche Großstädte**: Berlin, Hamburg, München, Köln, Frankfurt, etc.
- **5-20 Reviere pro Präsidium**: Zufällige Verteilung für realistische Szenarien
- **Echte Koordinaten**: Generiert innerhalb der deutschen Grenzen
- **Strukturierte IDs**: `pp-{stadtname}` für Präsidien, `{präsidium-id}-revier-{nummer}` für Reviere

### 🏛️ Detaillierte Revier-Informationen
- **Stadtteil-basierte Namen**: Mitte, Nord, Süd, Ost, West, Altstadt, Neustadt, etc.
- **Realistische Adressen**: Deutsche Straßennamen mit Hausnummern und PLZ
- **Kontaktdaten**: Telefonnummern mit echten Vorwahlen, E-Mail-Adressen
- **GeoJSON-Struktur**: Vorbereitet für echte Geodaten

### 📊 Umfassende Statistiken
- **Gesamtanzahl**: Präsidien und Reviere
- **Durchschnittswerte**: Reviere pro Präsidium
- **Performance-Metriken**: Für Monitoring und Optimierung

## Technische Details

### Datenstrukturen

```typescript
interface MockDataStats {
  totalPraesidien: number
  totalReviere: number
  avgRevierePerPraesidium: number
}

interface MockDataResult {
  praesidien: Praesidium[]
  reviere: Revier[]
  stats: MockDataStats
}
```

### Generierungsfunktionen

#### `generatePraesidien(count: number): Praesidium[]`
- Generiert Präsidien für die angegebene Anzahl von Städten
- Jedes Präsidium erhält 5-20 zufällige Reviere
- Koordinaten werden innerhalb Deutschlands generiert

#### `generateReviere(praesidium: Praesidium): Revier[]`
- Erstellt Reviere für ein spezifisches Präsidium
- Verwendet Stadtteil-Namen für realistische Bezeichnungen
- Generiert vollständige Kontaktdaten

#### `generateMockData(praesidienCount: number = 20): MockDataResult`
- Hauptfunktion für die Datengenerierung
- Kombiniert Präsidien und Reviere
- Berechnet Statistiken

### Performance-Optimierungen

#### Caching
```typescript
let cachedData: ReturnType<typeof generateMockData> | null = null

export function getLargeMockDataset() {
  if (!cachedData) {
    cachedData = generateMockData(20)
  }
  return cachedData
}
```

#### Helper-Funktionen
- `searchPraesidien()`: Effiziente Suche in Präsidien-Listen
- `getReviereByPraesidiumIdLarge()`: Schnelle Filterung von Revieren

## Verwendung

### Grundlegende Verwendung

```typescript
import { getLargeMockDataset, generateMockData } from './data/mockDataLarge'

// Verwende vorgefertigtes großes Dataset
const largeDataset = getLargeMockDataset()

// Oder generiere custom Dataset
const customDataset = generateMockData(15) // 15 Präsidien
```

### In Performance-Tests

```typescript
import { WizardStep2PerformanceTest } from './components/wizard'

// Komponente verwendet automatisch große Datensätze
<WizardStep2PerformanceTest />
```

### Dataset-Umschaltung

```typescript
const [currentDataset, setCurrentDataset] = useState<'small' | 'large'>('small')

const getReviereForPraesidium = (praesidiumId: string): Revier[] => {
  if (currentDataset === 'large') {
    return getReviereByPraesidiumIdLarge(praesidiumId, largeDataset.reviere)
  }
  return [] // Fallback zu kleinem Dataset
}
```

## Datenqualität

### Realistische Werte
- **Telefonnummern**: Echte deutsche Vorwahlen (030, 040, 089, etc.)
- **E-Mail-Domains**: Polizei-spezifische Domains (polizei.de, polizei.nrw.de, etc.)
- **Straßennamen**: Deutsche Präfixe und Suffixe (Hauptstraße, Bahnhofweg, etc.)
- **PLZ-Bereiche**: 10000-99999 für deutsche Postleitzahlen

### Konsistente Struktur
- **ID-Schema**: Hierarchische Struktur für einfache Filterung
- **Namenskonventionen**: Einheitliche Bezeichnungen
- **Geodaten**: Vorbereitet für echte GeoJSON-Integration

## Performance-Metriken

### Erwartete Werte
- **20 Präsidien**: ~200-400 Reviere insgesamt
- **Render-Zeit**: < 50ms für VirtualList mit 50 Items
- **Speicherverbrauch**: < 10MB für vollständiges Dataset
- **Such-Performance**: < 100ms für Filterung

### Monitoring
```typescript
const performanceReport = getPerformanceReport()
console.log({
  samples: performanceReport.samples,
  averageRenderTime: performanceReport.averageRenderTime,
  maxRenderTime: performanceReport.maxRenderTime,
  totalScrollEvents: performanceReport.totalScrollEvents
})
```

## Integration

### Mit VirtualizedData Hook
```typescript
const { displayData, totalItems, searchQuery, setSearchQuery } = useVirtualizedData({
  data: getReviereForPraesidium(praesidium.id),
  searchKeys: ['name'],
  itemsPerPage: 50,
  debounceMs: 300,
})
```

### Mit VirtualList
```typescript
<VirtualList
  items={reviere}
  itemHeight={120}
  containerHeight={400}
  renderItem={renderRevier}
  overscan={5} // Erhöht für große Datensätze
/>
```

## Wartung und Erweiterung

### Neue Städte hinzufügen
```typescript
const städte = [
  // Bestehende Städte...
  'NeueStadt', // Neue Stadt hinzufügen
]
```

### Zusätzliche Stadtteile
```typescript
const stadtteile = [
  // Bestehende Stadtteile...
  'Industriegebiet', // Neuer Stadtteil
]
```

### Erweiterte Kontaktdaten
```typescript
contact: {
  address: generateAddress(stadtname),
  phone: generatePhone(),
  email: generateEmail(`revier${revierNummer}.${stadtname}`),
  // Neue Felder hier hinzufügen
  website: `https://polizei.${stadtname.toLowerCase()}.de`,
  openingHours: '24/7',
}
```

## Fazit

Die erweiterten Mock-Daten bieten eine solide Grundlage für:
- **Performance-Tests** mit realistischen Datenmengen
- **UI/UX-Tests** mit authentischen deutschen Polizeidaten
- **Skalierbarkeitstests** für große Datensätze
- **Entwicklungs- und Debugging-Zwecke**

Die Daten sind so strukturiert, dass sie nahtlos in echte Produktionsumgebungen integriert werden können, sobald echte API-Endpunkte verfügbar sind. 