# Accessibility Hooks

Diese Datei beschreibt die implementierten Accessibility-Hooks für React-Komponenten im Projekt.

## Speicherort

Alle Hooks befinden sich in:
```
src/hooks/useAccessibility.ts
```

## Übersicht der Hooks

### 1. `useKeyboardNavigation`
**Zweck:**
- Ermöglicht Tastatur-Navigation (Pfeiltasten, Home/End, Enter/Leertaste) in Listen, Menüs oder Dropdowns.
- Unterstützt vertikale/horizontale Navigation, Wrapping und Auto-Fokus.

**Verwendung:**
```tsx
import { useKeyboardNavigation } from '@/hooks/useAccessibility'

const items = ['A', 'B', 'C']
const { containerRef, containerProps, getItemProps, focusedIndex } = useKeyboardNavigation(
  items,
  (index) => alert('Ausgewählt: ' + items[index]),
  { vertical: true, wrap: true, autoFocus: true }
)

return (
  <div ref={containerRef} {...containerProps}>
    {items.map((item, i) => (
      <div key={i} {...getItemProps(i)}>{item}</div>
    ))}
  </div>
)
```

---

### 2. `useAnnounce`
**Zweck:**
- Ermöglicht das Ausgeben von Statusmeldungen für Screenreader (z.B. nach einer Aktion).

**Verwendung:**
```tsx
import { useAnnounce } from '@/hooks/useAccessibility'

const announce = useAnnounce()

// Irgendwo im Code
announce('Aktion erfolgreich!', 'polite')
```

---

### 3. `useFocusTrap`
**Zweck:**
- Sorgt dafür, dass der Fokus in einem Modal/Dialog/Overlay bleibt (Tab-Trap).
- Optional: initialer Fokus, Rückgabe des Fokus nach Schließen.

**Verwendung:**
```tsx
import { useFocusTrap } from '@/hooks/useAccessibility'

const isOpen = true // z.B. Modal-Status
const modalRef = useFocusTrap<HTMLDivElement>(isOpen, { initialFocus: 'button', returnFocus: true })

return (
  <div ref={modalRef}>
    <button>Erstes Element</button>
    <button>Zweites Element</button>
  </div>
)
```

---

### 4. `usePrefersReducedMotion`
**Zweck:**
- Erkennt, ob der User in den Systemeinstellungen reduzierte Animationen wünscht.

**Verwendung:**
```tsx
import { usePrefersReducedMotion } from '@/hooks/useAccessibility'

const prefersReducedMotion = usePrefersReducedMotion()
if (prefersReducedMotion) {
  // Animationen abschalten oder reduzieren
}
```

---

### 5. `useAriaLive`
**Zweck:**
- Stellt eine ARIA-Live-Region als React-Komponente bereit, um dynamische Inhalte für Screenreader anzukündigen.

**Verwendung:**
```tsx
import { useAriaLive } from '@/hooks/useAccessibility'

const { updateRegion, LiveRegion } = useAriaLive()

// Im Render:
<>
  <LiveRegion />
  <button onClick={() => updateRegion('Neuer Status!')}>Status ansagen</button>
</>
```

---

## Vorteile
- **Barrierefreiheit**: Erfüllt wichtige WCAG- und ARIA-Anforderungen
- **Wiederverwendbar**: Kann in beliebigen Komponenten genutzt werden
- **Einfach zu integrieren**: Hooks sind sofort einsatzbereit

---

## Tipp
Kombiniere die Hooks für komplexe UI-Komponenten wie Dropdowns, Dialoge, Listen oder dynamische Statusmeldungen.

---

**Fragen oder Beispiele für konkrete Komponenten? Einfach melden!** 