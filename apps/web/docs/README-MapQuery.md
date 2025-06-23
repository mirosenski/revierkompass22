# Optimierter Map Store mit React Query

Dieser Store verwendet React Query für optimiertes State Management der Map-Komponente mit automatischem Caching, Synchronisation und Persistierung.

## Features

- **Viewport Management**: Automatische Persistierung in localStorage
- **Map Configuration**: Zentrale Konfiguration mit Caching
- **Layer Visibility**: Toggle-Funktionalität für Map-Layer
- **Map Instance Management**: Globale Map-Instanz-Verwaltung
- **Prefetching**: Vorladung von Map-Daten für bessere Performance
- **Query Invalidation**: Automatische Cache-Invalidierung

## Installation

Der Store benötigt React Query. Stelle sicher, dass der `QueryProvider` in deiner App eingebunden ist:

```tsx
// In main.tsx oder App.tsx
import { QueryProvider } from '@/providers/QueryProvider'

function App() {
  return (
    <QueryProvider>
      {/* Deine App */}
    </QueryProvider>
  )
}
```

## Verwendung

### Viewport Management

```tsx
import { useViewport } from '@/stores/mapQuery'

function MapComponent() {
  const { viewport, updateViewport, isLoading } = useViewport()
  
  // Viewport wird automatisch in localStorage gespeichert
  const handleZoom = () => {
    updateViewport({ zoom: viewport.zoom + 1 })
  }
  
  return (
    <div>
      <p>Center: {viewport.center.join(', ')}</p>
      <p>Zoom: {viewport.zoom}</p>
      <button onClick={handleZoom}>Zoom In</button>
    </div>
  )
}
```

### Map Configuration

```tsx
import { useMapConfig } from '@/stores/mapQuery'

function MapConfig() {
  const { data: config, isLoading, error } = useMapConfig()
  
  if (isLoading) return <div>Loading config...</div>
  if (error) return <div>Error loading config</div>
  
  return (
    <div>
      <p>Style: {config.style}</p>
      <p>Max Zoom: {config.maxZoom}</p>
    </div>
  )
}
```

### Layer Visibility

```tsx
import { useLayerVisibility } from '@/stores/mapQuery'

function LayerControls() {
  const { layers, toggleLayer } = useLayerVisibility()
  
  return (
    <div>
      {Object.entries(layers).map(([layer, visible]) => (
        <label key={layer}>
          <input
            type="checkbox"
            checked={visible}
            onChange={() => toggleLayer(layer as keyof typeof layers)}
          />
          {layer}
        </label>
      ))}
    </div>
  )
}
```

### Map Instance Management

```tsx
import { useMapInstance } from '@/stores/mapQuery'
import { Map } from 'maplibre-gl'

function MapComponent() {
  const { map, setMap } = useMapInstance()
  
  useEffect(() => {
    if (!map) {
      const newMap = new Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [8.6821, 50.1109],
        zoom: 6,
      })
      
      setMap(newMap)
    }
  }, [map, setMap])
  
  return <div id="map" className="w-full h-96" />
}
```

### Prefetching

```tsx
import { usePrefetchMapData } from '@/stores/mapQuery'

function App() {
  const prefetchMapData = usePrefetchMapData()
  
  useEffect(() => {
    // Lade Map-Daten vor, bevor sie benötigt werden
    prefetchMapData()
  }, [prefetchMapData])
  
  return <div>App Content</div>
}
```

## Query Keys

Der Store verwendet strukturierte Query Keys für optimale Cache-Verwaltung:

```ts
const mapKeys = {
  all: ['map'],
  viewport: () => [...mapKeys.all, 'viewport'],
  config: () => [...mapKeys.all, 'config'],
  layers: () => [...mapKeys.all, 'layers'],
  instance: () => [...mapKeys.all, 'instance'],
}
```

## Cache-Konfiguration

- **staleTime**: Infinity für statische Daten (viewport, config)
- **gcTime**: Infinity für persistierte Daten
- **Automatische Retry-Logik**: Keine Retries bei 4xx Fehlern
- **Window Focus**: Kein automatisches Refetch bei Fokus

## Erweiterungen

### Custom Layer Types

Füge neue Layer-Typen in der `toggleLayer` Funktion hinzu:

```tsx
case 'custom-layer':
  mapInstance.setLayoutProperty('custom-layer-fill', 'visibility', visibility)
  mapInstance.setLayoutProperty('custom-layer-border', 'visibility', visibility)
  break
```

### API Integration

Erweitere `useMapConfig` für API-Calls:

```tsx
export function useMapConfig() {
  return useQuery({
    queryKey: mapKeys.config(),
    queryFn: async () => {
      const response = await fetch('/api/map-config')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten
  })
}
```

### Optimistic Updates

Verwende optimistic updates für bessere UX:

```tsx
const updateViewport = useMutation({
  mutationFn: async (viewport: Partial<ViewportState>) => {
    // API call
    return updatedViewport
  },
  onMutate: async (newViewport) => {
    // Optimistic update
    await queryClient.cancelQueries(mapKeys.viewport())
    const previous = queryClient.getQueryData(mapKeys.viewport())
    queryClient.setQueryData(mapKeys.viewport(), newViewport)
    return { previous }
  },
  onError: (err, newViewport, context) => {
    // Rollback bei Fehler
    queryClient.setQueryData(mapKeys.viewport(), context?.previous)
  },
})
```

## Performance Vorteile

1. **Automatisches Caching**: Reduziert API-Calls
2. **Background Updates**: Daten werden im Hintergrund aktualisiert
3. **Optimistic Updates**: Sofortige UI-Updates
4. **Deduplication**: Mehrfache Requests werden dedupliziert
5. **Prefetching**: Daten werden vorab geladen
6. **Persistierung**: Viewport wird automatisch gespeichert 