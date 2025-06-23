# Sprint 4 - Erweiterte OSRM Integration & AdvancedMap

## Übersicht

Diese Erweiterung implementiert einen robusten OSRM Routing Service mit Zod-Validierung, Polyline-Dekodierung und erweiterten Funktionen für optimierte Routen und Distanzmatrizen.

## Neue Features

### 🔧 **Erweiterter OSRM Service**
- **Zod-Validierung**: Typsichere Validierung aller OSRM-Responses
- **Polyline-Dekodierung**: Unterstützung für polyline6-Format
- **Fallback-Server**: Mehrere OSRM-Instanzen für Redundanz
- **Timeout-Handling**: Automatische Abbruchung bei langsamen Anfragen
- **Error Recovery**: Graceful Degradation bei API-Fehlern

### 🛣️ **Erweiterte Routing-Funktionen**
- **Optimierte Routen**: TSP (Traveling Salesman Problem) Lösung
- **Distanzmatrizen**: Berechnung von Entfernungen zwischen allen Punkten
- **Schritt-für-Schritt Anweisungen**: Detaillierte Wegbeschreibungen
- **Mehrere Transportmodi**: Auto, Fahrrad, Fußgänger
- **Alternative Routen**: Mehrere Routenvorschläge

### 🗺️ **AdvancedMap Komponente**
- **Drei Routen-Modi**: Nächstes Revier, Optimierte Route, Benutzerauswahl
- **Interaktive Station-Auswahl**: Mehrfachauswahl von Revieren
- **Live-Suche**: Echtzeit-Filterung der Revierliste
- **Distanzmatrix-Anzeige**: Übersichtliche Darstellung aller Entfernungen
- **Erweiterte Routeninformationen**: Detaillierte Wegbeschreibungen

## Technische Implementierung

### OSRM Service (`services/osrm.ts`)

#### Zod-Schemas für Typsicherheit
```typescript
const RouteStepSchema = z.object({
  distance: z.number(),
  duration: z.number(),
  geometry: z.string(),
  name: z.string(),
  mode: z.string(),
  maneuver: z.object({
    bearing_after: z.number(),
    bearing_before: z.number(),
    location: z.array(z.number()).length(2),
    modifier: z.string().optional(),
    type: z.string(),
  }),
})
```

#### Polyline-Dekodierung
```typescript
export function decodePolyline(encoded: string): number[][] {
  // Dekodiert polyline6-Format zu Koordinaten
  // Unterstützt 6 Dezimalstellen für hohe Präzision
}
```

#### Erweiterte Routing-Funktionen
```typescript
// Standard-Route
export async function calculateRoute(waypoints: number[][], options?: RouteOptions)

// Optimierte Route (TSP)
export async function calculateOptimizedRoute(waypoints: number[][], options?: TSPOptions)

// Distanzmatrix
export async function getDistanceMatrix(waypoints: number[][], options?: MatrixOptions)
```

### Erweiterter Routing Service (`services/routing.ts`)

#### Integration mit OSRM
```typescript
// Enhanced route calculation with OSRM integration
export async function calculateRoute(
  start: RoutePoint,
  end: RoutePoint,
  via?: RoutePoint[]
): Promise<RouteResult>
```

#### Neue Funktionen
```typescript
// Optimierte Revier-Route
export async function calculateOptimizedStationRoute(
  userLocation: RoutePoint,
  stations: RoutePoint[]
): Promise<RouteResult | null>

// Distanzmatrix für Revier
export async function getDistanceMatrix(
  points: RoutePoint[]
): Promise<{
  distances: number[][]
  durations: number[][]
  nearestIndices: number[]
}>
```

### AdvancedMap Komponente (`components/ui/AdvancedMap.tsx`)

#### Drei Routen-Modi
1. **Nächstes Revier**: Route zum nächsten Polizeirevier
2. **Optimierte Route**: TSP-Lösung für alle Reviere
3. **Benutzerauswahl**: Route durch ausgewählte Reviere

#### Interaktive Features
- **Live-Suche**: Echtzeit-Filterung
- **Mehrfachauswahl**: Checkbox-basierte Auswahl
- **Farbkodierung**: Marker ändern Farbe basierend auf Auswahl
- **Distanzmatrix**: Tabellarische Übersicht aller Entfernungen

## Verwendung

### OSRM Service
```typescript
import { 
  osrmCalculateRoute, 
  calculateOptimizedRoute, 
  decodePolyline 
} from '@/services/osrm'

// Standard-Route
const route = await osrmCalculateRoute([[9.1770, 48.7758], [9.2167, 48.8000]])

// Optimierte Route
const optimizedRoute = await calculateOptimizedRoute(waypoints, {
  source: 'first',
  destination: 'first',
  roundtrip: true
})
```

### Erweiterter Routing Service
```typescript
import { 
  calculateOptimizedStationRoute, 
  getDistanceMatrix 
} from '@/services/routing'

// Optimierte Revier-Route
const route = await calculateOptimizedStationRoute(userLocation, stations)

// Distanzmatrix
const matrix = await getDistanceMatrix(stations)
```

### AdvancedMap Komponente
```tsx
import { AdvancedMap } from '@/components/ui/AdvancedMap'

<AdvancedMap
  stations={policeStations}
  userLocation={userLocation}
/>
```

## Datenstrukturen

### OSRM Response
```typescript
interface OSRMResponse {
  code: string
  routes: OSRMRoute[]
  waypoints: Array<{
    hint?: string
    distance?: number
    name: string
    location: [number, number]
  }>
}
```

### Erweiterte Route Result
```typescript
interface RouteResult {
  coordinates: number[][]
  distance: number
  duration: number
  summary: string
  steps?: Array<{
    distance: number
    duration: number
    instruction: string
    location: [number, number]
  }>
}
```

## Konfiguration

### OSRM Config
```typescript
export const OSRM_CONFIG = {
  baseUrl: 'https://router.project-osrm.org',
  fallbackUrls: [
    'https://routing.openstreetmap.de',
    'https://osrm.example.com',
  ],
  profile: 'driving', // car, bike, foot
  timeout: 10000, // 10 seconds
  maxWaypoints: 100,
}
```

## Performance Optimierungen

### Caching & Fallbacks
- **Browser-Cache**: Automatisches Caching von Routen-Ergebnissen
- **Fallback-Server**: Mehrere OSRM-Instanzen für Redundanz
- **Haversine-Fallback**: Direkte Entfernungsberechnung bei API-Fehlern
- **Timeout-Handling**: Automatische Abbruchung langsamer Anfragen

### Lazy Loading
- **Dynamische Imports**: OSRM-Funktionen werden nur bei Bedarf geladen
- **Progressive Enhancement**: Basis-Funktionen funktionieren ohne OSRM
- **Error Boundaries**: Graceful Degradation bei Fehlern

## Error Handling

### Robuste Fehlerbehandlung
```typescript
try {
  const route = await osrmCalculateRoute(waypoints)
  return route
} catch (error) {
  console.error('OSRM routing failed, using fallback:', error)
  // Fallback zu Haversine-Berechnung
  return calculateFallbackRoute(waypoints)
}
```

### Fallback-Strategien
1. **OSRM Primary**: Haupt-OSRM-Server
2. **OSRM Fallback**: Alternative OSRM-Server
3. **Haversine**: Direkte Entfernungsberechnung
4. **User Notification**: Benutzerfreundliche Fehlermeldungen

## Browser Support

### Unterstützte Features
- **AbortSignal.timeout()**: Moderne Browser (Chrome 90+, Firefox 88+)
- **Polyline6**: Alle modernen Browser
- **Fetch API**: Alle modernen Browser
- **Zod Validation**: TypeScript-kompatible Browser

### Fallbacks
- **Timeout**: Manueller Timeout für ältere Browser
- **Polyline**: Standard-Polyline für ältere OSRM-Versionen
- **XMLHttpRequest**: Fallback für ältere Browser

## Zukünftige Erweiterungen

### Geplante Features
- **Offline-Routing**: Lokale OSRM-Instanz
- **Echtzeit-Verkehr**: Live-Verkehrsdaten
- **Mehrere Transportmodi**: ÖPNV, Fahrrad, Fußgänger
- **3D-Routing**: Höhenprofile und 3D-Routen
- **Voice Navigation**: Sprachgesteuerte Navigation

### Technische Verbesserungen
- **Service Worker**: Offline-Funktionalität
- **WebAssembly**: Performance-Optimierung
- **WebGL**: Hardware-beschleunigte Rendering
- **PWA**: Progressive Web App Features

## Troubleshooting

### Häufige Probleme

#### OSRM API-Fehler
```typescript
// Prüfen Sie die OSRM-Server-Verfügbarkeit
const response = await fetch('https://router.project-osrm.org/route/v1/driving/9.1770,48.7758;9.2167,48.8000')
console.log('OSRM Status:', response.status)
```

#### Polyline-Dekodierung
```typescript
// Debug-Polyline-Dekodierung
const coordinates = decodePolyline(encodedPolyline)
console.log('Decoded coordinates:', coordinates)
```

#### Timeout-Probleme
```typescript
// Erhöhen Sie das Timeout bei langsamen Verbindungen
const route = await osrmCalculateRoute(waypoints, {
  timeout: 15000 // 15 Sekunden
})
```

### Debug-Modus
```typescript
// Aktivieren Sie erweiterte Logging
localStorage.setItem('debug', 'osrm,routing,advanced-map')
```

## Lizenz & Credits

### Open Source Libraries
- **OSRM**: BSD 2-Clause License
- **Zod**: MIT License
- **MapLibre GL JS**: BSD 3-Clause License

### Dependencies
```json
{
  "maplibre-gl": "^3.6.0",
  "zod": "^3.25.67"
}
```

---

**Status**: ✅ Erweiterte OSRM-Integration abgeschlossen  
**Nächster Schritt**: Sprint 5 - Offline-Funktionalität & Performance-Optimierungen 