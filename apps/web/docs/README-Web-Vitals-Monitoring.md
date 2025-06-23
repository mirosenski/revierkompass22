# Web Vitals Monitoring

Diese Dokumentation beschreibt die Implementierung des Web Vitals Monitorings für das Revierkompass-Projekt.

## Übersicht

Das Projekt verwendet die `web-vitals` Bibliothek (Version 5.0.3) zur Messung und Überwachung der Core Web Vitals und weiterer Performance-Metriken.

## Implementierte Metriken

### Core Web Vitals

#### 1. LCP (Largest Contentful Paint)
**Zweck:** Misst die Zeit bis zum Laden des größten sichtbaren Inhalts
**Ziel:** < 2.5 Sekunden
**Messung:** `onLCP` aus web-vitals

#### 2. FID (First Input Delay)
**Zweck:** Misst die Zeit bis zur ersten Interaktion
**Ziel:** < 100 Millisekunden
**Messung:** `onFID` aus web-vitals

#### 3. CLS (Cumulative Layout Shift)
**Zweck:** Misst die visuelle Stabilität
**Ziel:** < 0.1
**Messung:** `onCLS` aus web-vitals

### Weitere Performance-Metriken

#### 4. FCP (First Contentful Paint)
**Zweck:** Misst die Zeit bis zum ersten sichtbaren Inhalt
**Messung:** `onFCP` aus web-vitals

#### 5. TTFB (Time to First Byte)
**Zweck:** Misst die Server-Antwortzeit
**Messung:** `onTTFB` aus web-vitals

#### 6. INP (Interaction to Next Paint)
**Zweck:** Misst die Interaktivität (neue Core Web Vital)
**Ziel:** < 200 Millisekunden
**Messung:** `onINP` aus web-vitals

## Implementierung

### Service: `src/services/webVitals.ts`

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Analytics-Queue für Batch-Sending
const analyticsQueue: any[] = [];

// Performance Observer für Long Tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Long Task Detection
  }
});

// Utility-Funktionen für eigene Messungen
export const measureCustomMetric = (name: string, value: number) => {
  // Custom metric implementation
};
```

### Hooks: `src/hooks/useWebVitals.ts`

```typescript
import { useEffect } from 'react';
import { initWebVitals } from '@/services/webVitals';

export const useWebVitals = () => {
  useEffect(() => {
    initWebVitals();
  }, []);
};
```

## Analytics-Integration

### Batch-Sending

**Zweck:** Effiziente Datenübertragung an Analytics-Endpunkt

**Features:**
- Sammeln von Metriken in Queue
- Batch-Sending alle 5 Sekunden
- Retry-Mechanismus bei Fehlern
- Offline-Support mit localStorage

### Performance Observer

**Zweck:** Überwachung von Long Tasks und langsamen Ressourcen

**Überwachte Events:**
- Long Tasks (> 50ms)
- Langsame Netzwerk-Requests
- Layout Shifts
- Resource Loading

## Verwendung

### 1. Service initialisieren

```typescript
// In main.tsx oder App.tsx
import { initWebVitals } from '@/services/webVitals';

initWebVitals();
```

### 2. Hook verwenden

```typescript
// In Komponenten
import { useWebVitals } from '@/hooks/useWebVitals';

const MyComponent = () => {
  useWebVitals();
  // ...
};
```

### 3. Custom Metriken messen

```typescript
import { measureCustomMetric } from '@/services/webVitals';

// Custom Performance-Messung
const startTime = performance.now();
// ... Operation ...
const endTime = performance.now();
measureCustomMetric('custom-operation', endTime - startTime);
```

## Konfiguration

### Analytics-Endpunkt

```typescript
// In webVitals.ts
const ANALYTICS_ENDPOINT = '/api/analytics';
const BATCH_INTERVAL = 5000; // 5 Sekunden
const MAX_QUEUE_SIZE = 100;
```

### Thresholds

```typescript
// Performance-Schwellenwerte
const THRESHOLDS = {
  LCP: 2500,    // 2.5s
  FID: 100,     // 100ms
  CLS: 0.1,     // 0.1
  INP: 200,     // 200ms
  TTFB: 800,    // 800ms
};
```

## Monitoring Dashboard

### Verfügbare Metriken

1. **Real-time Performance:**
   - LCP, FID, CLS, INP, FCP, TTFB
   - Custom Metriken
   - Long Tasks

2. **Trends:**
   - Performance über Zeit
   - Device/Network-basierte Analyse
   - User Journey Tracking

3. **Alerts:**
   - Performance-Degradation
   - Threshold-Überschreitungen
   - Anomaly Detection

## Troubleshooting

### Häufige Probleme

1. **Keine Metriken empfangen:**
   - Überprüfen Sie die Analytics-Endpunkt-Konfiguration
   - Prüfen Sie die Netzwerk-Verbindung
   - Überprüfen Sie die Browser-Konsole auf Fehler

2. **Falsche Werte:**
   - Stellen Sie sicher, dass die web-vitals Version korrekt ist
   - Überprüfen Sie die Threshold-Konfiguration
   - Prüfen Sie auf Browser-Extensions, die Performance beeinflussen

3. **Performance-Impact:**
   - Monitoring-Code läuft asynchron
   - Batch-Sending reduziert Netzwerk-Overhead
   - Observer werden automatisch bereinigt

### Debug-Modus

```typescript
// Aktivieren Sie Debug-Logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Web Vitals Debug:', metric);
}
```

## Best Practices

### 1. Metriken-Sammlung

- Sammeln Sie Metriken nur bei echten Nutzer-Interaktionen
- Vermeiden Sie Sampling in der Entwicklung
- Verwenden Sie Real User Monitoring (RUM)

### 2. Performance-Optimierung

- Minimieren Sie den Impact des Monitoring-Codes
- Verwenden Sie Web Workers für schwere Berechnungen
- Implementieren Sie intelligentes Sampling

### 3. Datenqualität

- Validieren Sie Metriken vor dem Senden
- Implementieren Sie Outlier-Detection
- Verwenden Sie konsistente Einheiten

## Erweiterte Features

### Geplante Verbesserungen

- [ ] Custom Metric Builder
- [ ] Performance Budget Monitoring
- [ ] A/B Testing Integration
- [ ] User Experience Scoring
- [ ] Predictive Performance Analysis

### Integration mit anderen Tools

- Google Analytics 4
- Google Search Console
- Custom Analytics Platform
- Error Tracking (Sentry)
- APM Tools (New Relic, DataDog) 