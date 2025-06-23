# Wizard Store

Dieser Store verwaltet den Zustand für den Revierkompass Wizard mit Zustand.

## Features

- **Persistierung**: Der Store wird automatisch im localStorage gespeichert
- **DevTools**: Unterstützung für Redux DevTools
- **Immer**: Immutable Updates mit Immer
- **TypeScript**: Vollständige TypeScript-Unterstützung

## Verwendung

### Grundlegende Verwendung

```typescript
import { useWizardStore } from '../stores/wizard'

function MyComponent() {
  const {
    currentStep,
    query,
    searchResults,
    praesidium,
    selectedReviere,
    setQuery,
    choosePraesidium,
    nextStep,
    previousStep,
  } = useWizardStore()

  // Komponente hier...
}
```

### Selektoren verwenden

```typescript
import { useWizardStore, selectCanProceedToStep2, selectCanProceedToStep3 } from '../stores/wizard'

function MyComponent() {
  const canProceedToStep2 = useWizardStore(selectCanProceedToStep2)
  const canProceedToStep3 = useWizardStore(selectCanProceedToStep3)

  // Komponente hier...
}
```

## Store-Struktur

### State

```typescript
interface WizardState {
  // Step 0 - Start location
  startAddress?: string
  startCoords?: [number, number]
  
  // Step 1 - Search
  query: string
  searchResults: Praesidium[]
  praesidium?: Praesidium
  
  // Step 2 - Reviere selection
  selectedReviere: Revier[]
  availableReviere: Revier[]
  
  // Navigation
  currentStep: number
}
```

### Actions

- `setStart(addr: string, coords?: [number, number])` - Startadresse und Koordinaten setzen
- `setQuery(q: string)` - Suchanfrage setzen
- `setSearchResults(results: Praesidium[])` - Suchergebnisse setzen
- `choosePraesidium(p: Praesidium)` - Praesidium auswählen und zu Schritt 2 wechseln
- `toggleRevier(revier: Revier)` - Revier zur Auswahl hinzufügen/entfernen
- `setAvailableReviere(reviere: Revier[])` - Verfügbare Reviere setzen
- `nextStep()` - Zum nächsten Schritt
- `previousStep()` - Zum vorherigen Schritt
- `goToStep(step: number)` - Zu einem bestimmten Schritt springen
- `reset()` - Store zurücksetzen

### Selektoren

- `selectCanProceedToStep2` - Prüft, ob zu Schritt 2 gewechselt werden kann
- `selectCanProceedToStep3` - Prüft, ob zu Schritt 3 gewechselt werden kann
- `selectIsStepCompleted(step: number)` - Prüft, ob ein Schritt abgeschlossen ist

## Typen

### Praesidium

```typescript
interface Praesidium {
  id: string
  name: string
  coordinates: [number, number]
  childReviere: string[]
}
```

### Revier

```typescript
interface Revier {
  id: string
  name: string
  praesidiumId: string
  geometry: any // GeoJSON geometry
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
}
```

## Persistierung

Der Store wird automatisch im localStorage unter dem Schlüssel `revierkompass-wizard` gespeichert. Folgende Felder werden persistiert:

- `startAddress`
- `startCoords`
- `query`
- `praesidium`
- `selectedReviere`
- `currentStep`

## Beispiel

Siehe `WizardExample.tsx` für ein vollständiges Beispiel der Verwendung. 