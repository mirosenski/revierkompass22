# Build-Optimierung mit Vite

Diese Dokumentation beschreibt die implementierten Build-Optimierungen für das Revierkompass-Projekt mit Vite.

## Übersicht

Das Projekt verwendet Vite als Build-Tool mit umfangreichen Optimierungen für Performance, PWA-Funktionalität und Sicherheit.

## Implementierte Optimierungen

### 1. PWA-Integration mit Workbox

**Zweck:** Progressive Web App mit Offline-Funktionalität und intelligentem Caching

**Features:**
- Caching für OpenStreetMap-Tiles
- OSRM-Routing-Cache
- Nominatim-Geocoding-Cache
- Service Worker für Offline-Funktionalität

**Konfiguration:** `vite.config.ts`

### 2. Komprimierung

**Zweck:** Reduzierung der Bundle-Größe für schnellere Ladezeiten

**Implementiert:**
- Gzip-Komprimierung
- Brotli-Komprimierung
- Automatische Komprimierung im Build-Prozess

### 3. Code-Splitting

**Zweck:** Aufteilung des Codes in kleinere Chunks für bessere Performance

**Features:**
- Manuelles Code-Splitting mit Rollup-Optionen
- Dynamische Imports für Lazy Loading
- Route-basiertes Code-Splitting

### 4. Asset-Optimierung

**Zweck:** Optimierung von Assets für bessere Performance

**Einstellungen:**
- `drop_console: true` - Entfernung von console.log im Production Build
- `cssCodeSplit: true` - CSS-Code-Splitting aktiviert
- `sourcemap: false` - Keine Sourcemaps im Production Build
- Asset-Optimierung für Bilder und andere Medien

### 5. Sicherheits-Header

**Zweck:** Verbesserung der Sicherheit im Development-Server

**Implementiert:**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### 6. Alias-Konfiguration

**Zweck:** Vereinfachung von Imports und bessere Code-Organisation

**Konfiguriert:**
- `@/` für `src/`
- `@components/` für `src/components/`
- `@lib/` für `src/lib/`

## Verwendung

### Development-Server starten

```bash
npm run dev
```

### Production Build erstellen

```bash
npm run build
```

### Build analysieren

```bash
npm run build:analyze
```

## PWA-Features

### Icons und Manifest

Die PWA-Icons sind in `public/` konfiguriert:
- Verschiedene Größen für verschiedene Geräte
- Automatische Generierung aus SVG-Quelle
- Manifest-Datei für PWA-Installation

### Offline-Funktionalität

- Caching von Map-Tiles für Offline-Nutzung
- Routing-Daten werden gecacht
- Geocoding-Ergebnisse werden gespeichert

## Performance-Metriken

Die Build-Optimierungen zielen auf folgende Metriken ab:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Bundle-Größe:** Minimiert durch Code-Splitting und Komprimierung

## Troubleshooting

### Build-Fehler

1. **PWA-Plugin-Fehler:** Stellen Sie sicher, dass alle Icons vorhanden sind
2. **Komprimierungsfehler:** Überprüfen Sie die Node.js-Version
3. **Alias-Fehler:** Überprüfen Sie die tsconfig.json-Pfade

### Performance-Probleme

1. **Langsame Builds:** Verwenden Sie `npm run build:analyze` zur Analyse
2. **Große Bundle-Größe:** Überprüfen Sie das Code-Splitting
3. **PWA-Caching-Probleme:** Löschen Sie den Service Worker-Cache

## Weitere Optimierungen

### Geplante Verbesserungen

- [ ] Tree Shaking für ungenutzte Dependencies
- [ ] Preloading kritischer Ressourcen
- [ ] HTTP/2 Server Push
- [ ] Image-Optimierung mit WebP

### Monitoring

- Build-Zeit-Monitoring
- Bundle-Größe-Tracking
- Performance-Metriken-Überwachung 