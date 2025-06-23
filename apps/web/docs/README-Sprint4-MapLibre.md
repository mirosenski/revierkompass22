# Sprint 4 - MapLibre Integration & Routing

## Übersicht

Sprint 4 implementiert eine vollständige Kartenintegration mit MapLibre GL JS und erweiterten Routing-Funktionen für die Revierkompass-Anwendung.

## Neue Features

### 🗺️ MapLibre GL JS Integration
- **Interaktive Karten**: Vollständige Integration von MapLibre GL JS
- **Deutschland-begrenzte Karten**: Automatische Begrenzung auf deutsche Grenzen
- **OpenStreetMap Tiles**: Kostenlose Kartendaten ohne API-Schlüssel
- **Navigation Controls**: Zoom, Pan und Scale Controls
- **Responsive Design**: Optimiert für alle Bildschirmgrößen

### 🎯 Marker & Popups
- **Polizeirevier-Marker**: Farbcodierte Marker für alle Reviere
- **Interaktive Popups**: Detaillierte Informationen zu jedem Revier
- **Benutzerstandort**: Grüner Marker für den aktuellen Standort
- **Dynamische Farben**: Marker ändern Farbe basierend auf Auswahl

### 🛣️ Routing & Navigation
- **OSRM Integration**: Open Source Routing Machine für echte Routenberechnung
- **Automatische Routenfindung**: Zum nächsten Revier oder zu einem ausgewählten Revier
- **Routenvisualisierung**: Blaue Routenlinien auf der Karte
- **Distanz & Zeit**: Anzeige von Entfernung und geschätzter Fahrzeit
- **Fallback-Routing**: Direkte Linien bei API-Fehlern

### 🔍 Erweiterte Suche
- **Live-Suche**: Echtzeit-Filterung der Revierliste
- **Suchfunktionen**: Suche nach Name oder Adresse
- **Filterbare Liste**: Übersichtliche Darstellung aller Reviere
- **Auswahl-Indikatoren**: Visuelle Hervorhebung ausgewählter Reviere

## Technische Implementierung

### Services

#### MapLibre Service (`services/maplibre.ts`)
```typescript
// Hauptfunktionen:
- createMap(): Erstellt eine neue Karteninstanz
- addMarker(): Fügt Marker zur Karte hinzu
- addRouteLayer(): Erstellt Routen-Layer
- updateRoute(): Aktualisiert Routendaten
- addRevierLayer(): Fügt Revier-Polygone hinzu
- fitBounds(): Passt Karte an Koordinaten an
- animateTo(): Animierte Kamerabewegungen
```

#### Routing Service (`services/routing.ts`)
```typescript
// Hauptfunktionen:
- calculateRoute(): Berechnet Route zwischen zwei Punkten
- routeToNearestStation(): Findet Route zum nächsten Revier
- findNearestPoint(): Findet den nächsten Punkt
- calculateDistance(): Haversine-Formel für Entfernungen
- formatDistance(): Formatierung für Anzeige
- formatDuration(): Formatierung für Zeit
```

### Komponenten

#### Map Component (`components/ui/Map.tsx`)
- **Props**: `markers`, `routes`, `center`, `zoom`, `fitToBounds`
- **Events**: `onMapLoad` für Karteninitialisierung
- **Features**: Automatische Marker-Verwaltung, Routen-Updates

#### MapWithRouting Component (`components/ui/MapWithRouting.tsx`)
- **Props**: `stations`, `userLocation`
- **Features**: Integrierte Suche, Routing, Station-Liste
- **UI**: Floating Panels für Suche und Routeninformationen

### Konfiguration

#### Karten-Konfiguration
```typescript
export const MAP_CONFIG = {
  bounds: {
    north: 55.0, south: 47.3, east: 15.0, west: 5.9
  },
  defaultCenter: { lng: 8.6821, lat: 50.1109 }, // Frankfurt
  zoom: { default: 6, city: 11, district: 13, street: 16 }
}
```

#### Styling
- **Light/Dark Mode**: Automatische Anpassung an Theme
- **Responsive**: Mobile-optimierte Steuerelemente
- **Accessibility**: Keyboard-Navigation und Screen Reader Support

## Verwendung

### Einfache Karte
```tsx
import { Map } from '@/components/ui/Map'

<Map
  markers={policeStations}
  center={userLocation}
  zoom={12}
  onMapLoad={handleMapLoad}
/>
```

### Erweiterte Karte mit Routing
```tsx
import { MapWithRouting } from '@/components/ui/MapWithRouting'

<MapWithRouting
  stations={policeStations}
  userLocation={userLocation}
/>
```

### Routing Service
```typescript
import { calculateRoute, routeToNearestStation } from '@/services/routing'

// Route zwischen zwei Punkten
const route = await calculateRoute(startPoint, endPoint)

// Route zum nächsten Revier
const nearestRoute = await routeToNearestStation(userLocation, stations)
```

## Datenstrukturen

### Police Station
```typescript
interface PoliceStation {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  address: string
}
```

### Route Result
```typescript
interface RouteResult {
  coordinates: number[][] // GeoJSON coordinates
  distance: number // in meters
  duration: number // in seconds
  summary: string // formatted string
}
```

## API Integration

### OSRM (Open Source Routing Machine)
- **URL**: `https://router.project-osrm.org/route/v1/driving/`
- **Fallback**: Direkte Linien bei API-Fehlern
- **Caching**: Browser-Cache für wiederholte Anfragen

### OpenStreetMap Tiles
- **URLs**: `https://{a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution**: © OpenStreetMap contributors
- **Lizenz**: Open Data Commons Open Database License

## Performance Optimierungen

### Karten-Performance
- **Lazy Loading**: Marker werden nur bei Bedarf geladen
- **Viewport Culling**: Nur sichtbare Marker werden gerendert
- **Memory Management**: Automatische Bereinigung nicht verwendeter Layer

### Routing-Performance
- **Debounced Requests**: Verzögerte API-Anfragen bei schnellen Änderungen
- **Error Handling**: Graceful Degradation bei API-Fehlern
- **Caching**: Lokale Speicherung von Routen-Ergebnissen

## Browser Support

### Unterstützte Browser
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Fallbacks
- **Geolocation**: Warnung bei nicht unterstützten Browsern
- **Map Tiles**: Alternative Tile-Server bei Ausfällen
- **Routing**: Direkte Linien bei API-Problemen

## Zukünftige Erweiterungen

### Geplante Features
- **Offline-Karten**: Lokale Kartenspeicherung
- **Mehrere Transportmodi**: Fußgänger, Fahrrad, ÖPNV
- **Echtzeit-Verkehr**: Live-Verkehrsdaten
- **3D-Gebäude**: 3D-Kartenansicht
- **Augmented Reality**: AR-Navigation

### Technische Verbesserungen
- **Service Worker**: Offline-Funktionalität
- **WebGL Optimierung**: Bessere Rendering-Performance
- **Progressive Web App**: PWA-Features
- **Voice Navigation**: Sprachgesteuerte Navigation

## Troubleshooting

### Häufige Probleme

#### Karte lädt nicht
1. Prüfen Sie die Internetverbindung
2. Überprüfen Sie die Browser-Konsole auf Fehler
3. Stellen Sie sicher, dass MapLibre CSS geladen ist

#### Routing funktioniert nicht
1. Prüfen Sie die OSRM API-Verfügbarkeit
2. Überprüfen Sie die Koordinaten-Formatierung
3. Testen Sie mit einfachen Koordinaten

#### Marker werden nicht angezeigt
1. Prüfen Sie das Koordinaten-Format [lng, lat]
2. Überprüfen Sie die Marker-Props
3. Stellen Sie sicher, dass die Karte geladen ist

### Debug-Modus
```typescript
// Aktivieren Sie Debug-Logging
localStorage.setItem('debug', 'maplibre,routing')
```

## Lizenz & Credits

### Open Source Libraries
- **MapLibre GL JS**: BSD 3-Clause License
- **OSRM**: BSD 2-Clause License
- **OpenStreetMap**: ODbL License

### Dependencies
```json
{
  "maplibre-gl": "^3.6.0",
  "@types/maplibre-gl": "^3.6.0"
}
```

---

**Sprint 4 Status**: ✅ Abgeschlossen  
**Nächster Sprint**: Sprint 5 - Erweiterte Features & Optimierungen 