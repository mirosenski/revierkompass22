# Optimierter Map Store mit React Query

Diese Dokumentation beschreibt die Implementierung des optimierten Map Stores mit React Query für das Revierkompass-Projekt.

## Übersicht

Der Map Store verwendet React Query für effizientes State Management, Caching und Synchronisation von Map-bezogenen Daten.

## Architektur

### Store-Struktur

```
src/stores/
├── map.ts              # Haupt-Map-Store
├── mapQuery.ts         # React Query-Konfiguration
└── index.ts           # Store-Exporte
```

### Zustandsverwaltung

Der Store verwaltet folgende Zustände:

1. **Viewport-Status** - Aktuelle Kartenposition und Zoom
2. **Map-Konfiguration** - Karten-Einstellungen und Layer
3. **Layer-Sichtbarkeit** - Sichtbarkeit verschiedener Kartenebenen
4. **Map-Instanz** - Referenz auf die MapLibre-Instanz

## Implementierung

### 1. Map Store (`src/stores/map.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MapState {
  viewport: Viewport;
  mapConfig: MapConfig;
  layerVisibility: LayerVisibility;
  mapInstance: Map | null;
  
  // Actions
  setViewport: (viewport: Viewport) => void;
  setMapConfig: (config: MapConfig) => void;
  setLayerVisibility: (layer: string, visible: boolean) => void;
  setMapInstance: (map: Map | null) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      // Initial state
      viewport: { lat: 52.5200, lng: 13.4050, zoom: 10 },
      mapConfig: { /* default config */ },
      layerVisibility: { /* default layers */ },
      mapInstance: null,
      
      // Actions
      setViewport: (viewport) => set({ viewport }),
      setMapConfig: (config) => set({ mapConfig: config }),
      setLayerVisibility: (layer, visible) => 
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            [layer]: visible
          }
        })),
      setMapInstance: (map) => set({ mapInstance: map }),
    }),
    {
      name: 'map-store',
      partialize: (state) => ({ 
        viewport: state.viewport,
        mapConfig: state.mapConfig 
      }),
    }
  )
);
```

### 2. React Query Integration (`src/stores/mapQuery.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMapStore } from './map';

// Query Keys
export const mapQueryKeys = {
  viewport: ['map', 'viewport'],
  config: ['map', 'config'],
  layers: ['map', 'layers'],
  tiles: ['map', 'tiles'],
} as const;

// Viewport Query
export const useViewportQuery = () => {
  const viewport = useMapStore((state) => state.viewport);
  
  return useQuery({
    queryKey: mapQueryKeys.viewport,
    queryFn: () => viewport,
    staleTime: 5 * 60 * 1000, // 5 Minuten
    gcTime: 10 * 60 * 1000,   // 10 Minuten
  });
};

// Map Config Query
export const useMapConfigQuery = () => {
  const mapConfig = useMapStore((state) => state.mapConfig);
  
  return useQuery({
    queryKey: mapQueryKeys.config,
    queryFn: () => mapConfig,
    staleTime: 10 * 60 * 1000, // 10 Minuten
  });
};

// Layer Visibility Query
export const useLayerVisibilityQuery = () => {
  const layerVisibility = useMapStore((state) => state.layerVisibility);
  
  return useQuery({
    queryKey: mapQueryKeys.layers,
    queryFn: () => layerVisibility,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
};
```

### 3. Mutations

```typescript
// Viewport Mutation
export const useUpdateViewport = () => {
  const queryClient = useQueryClient();
  const setViewport = useMapStore((state) => state.setViewport);
  
  return useMutation({
    mutationFn: (viewport: Viewport) => {
      setViewport(viewport);
      return viewport;
    },
    onSuccess: (viewport) => {
      queryClient.setQueryData(mapQueryKeys.viewport, viewport);
      queryClient.invalidateQueries({ queryKey: mapQueryKeys.tiles });
    },
  });
};

// Layer Visibility Mutation
export const useUpdateLayerVisibility = () => {
  const queryClient = useQueryClient();
  const setLayerVisibility = useMapStore((state) => state.setLayerVisibility);
  
  return useMutation({
    mutationFn: ({ layer, visible }: { layer: string; visible: boolean }) => {
      setLayerVisibility(layer, visible);
      return { layer, visible };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mapQueryKeys.layers });
    },
  });
};
```

## Verwendung

### 1. QueryProvider einrichten

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 Minuten
      gcTime: 10 * 60 * 1000,   // 10 Minuten
      retry: 3,
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

### 2. In Komponenten verwenden

```typescript
// src/components/ui/MapWithQuery.tsx
import { useViewportQuery, useUpdateViewport } from '@/stores/mapQuery';

export const MapWithQuery = () => {
  const { data: viewport, isLoading } = useViewportQuery();
  const updateViewport = useUpdateViewport();
  
  const handleMapMove = (newViewport: Viewport) => {
    updateViewport.mutate(newViewport);
  };
  
  if (isLoading) return <div>Lade Karte...</div>;
  
  return (
    <Map 
      viewport={viewport}
      onMove={handleMapMove}
    />
  );
};
```

### 3. Layer-Management

```typescript
import { useLayerVisibilityQuery, useUpdateLayerVisibility } from '@/stores/mapQuery';

export const LayerControls = () => {
  const { data: layerVisibility } = useLayerVisibilityQuery();
  const updateLayer = useUpdateLayerVisibility();
  
  const toggleLayer = (layer: string) => {
    const currentVisibility = layerVisibility?.[layer] ?? false;
    updateLayer.mutate({ layer, visible: !currentVisibility });
  };
  
  return (
    <div>
      {Object.entries(layerVisibility ?? {}).map(([layer, visible]) => (
        <label key={layer}>
          <input
            type="checkbox"
            checked={visible}
            onChange={() => toggleLayer(layer)}
          />
          {layer}
        </label>
      ))}
    </div>
  );
};
```

## Features

### 1. Persistierung

**Zweck:** Beibehaltung des Viewports und der Konfiguration über Sessions

**Implementiert:**
- Viewport-Persistierung in localStorage
- Map-Konfiguration wird gespeichert
- Automatische Wiederherstellung beim Neuladen

### 2. Prefetching

**Zweck:** Vorausladung von Daten für bessere Performance

```typescript
// Prefetch Viewport bei Hover
const prefetchViewport = () => {
  queryClient.prefetchQuery({
    queryKey: mapQueryKeys.viewport,
    queryFn: () => currentViewport,
  });
};
```

### 3. Cache-Invalidierung

**Zweck:** Intelligente Cache-Verwaltung

```typescript
// Invalidate tiles when viewport changes
queryClient.invalidateQueries({ queryKey: mapQueryKeys.tiles });

// Invalidate layers when config changes
queryClient.invalidateQueries({ queryKey: mapQueryKeys.layers });
```

### 4. Optimistic Updates

**Zweck:** Sofortige UI-Updates für bessere UX

```typescript
export const useOptimisticViewportUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateViewport,
    onMutate: async (newViewport) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: mapQueryKeys.viewport });
      
      // Snapshot previous value
      const previousViewport = queryClient.getQueryData(mapQueryKeys.viewport);
      
      // Optimistically update
      queryClient.setQueryData(mapQueryKeys.viewport, newViewport);
      
      return { previousViewport };
    },
    onError: (err, newViewport, context) => {
      // Rollback on error
      queryClient.setQueryData(mapQueryKeys.viewport, context?.previousViewport);
    },
  });
};
```

## Performance-Optimierungen

### 1. Selektive Updates

```typescript
// Nur Viewport-Komponenten neu rendern
const viewport = useMapStore((state) => state.viewport);

// Nur Layer-Visibility-Komponenten neu rendern
const layerVisibility = useMapStore((state) => state.layerVisibility);
```

### 2. Debounced Updates

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedViewport = useDebounce(viewport, 300);

useEffect(() => {
  if (debouncedViewport) {
    updateViewport.mutate(debouncedViewport);
  }
}, [debouncedViewport]);
```

### 3. Background Refetching

```typescript
const { data, refetch } = useViewportQuery({
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: true,
});
```

## Best Practices

### 1. Query-Keys

- Verwenden Sie konsistente Query-Keys
- Strukturieren Sie Keys hierarchisch
- Verwenden Sie `as const` für Type Safety

### 2. Error Handling

```typescript
const { data, error, isError } = useViewportQuery();

if (isError) {
  return <div>Fehler beim Laden der Karte: {error.message}</div>;
}
```

### 3. Loading States

```typescript
const { data, isLoading, isFetching } = useViewportQuery();

return (
  <div>
    {isLoading && <div>Lade Karte...</div>}
    {isFetching && <div>Aktualisiere...</div>}
    <Map data={data} />
  </div>
);
```

## Troubleshooting

### Häufige Probleme

1. **Cache-Inkonsistenz:**
   - Verwenden Sie `queryClient.clear()` zum Zurücksetzen
   - Überprüfen Sie Query-Keys auf Duplikate
   - Stellen Sie sicher, dass Mutations korrekt invalidieren

2. **Performance-Probleme:**
   - Überprüfen Sie `staleTime` und `gcTime`
   - Verwenden Sie `select` für partielle Updates
   - Implementieren Sie Debouncing für häufige Updates

3. **Persistierungsprobleme:**
   - Überprüfen Sie localStorage-Berechtigungen
   - Stellen Sie sicher, dass `partialize` korrekt konfiguriert ist
   - Testen Sie in verschiedenen Browsern

## Erweiterte Features

### Geplante Verbesserungen

- [ ] Offline-Support mit Service Worker
- [ ] Real-time Synchronisation
- [ ] Conflict Resolution
- [ ] Advanced Caching Strategies
- [ ] Performance Monitoring Integration 