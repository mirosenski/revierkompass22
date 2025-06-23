# Dark Mode Implementation - RevierKompass

## Übersicht

Diese Implementierung bietet eine vollständige Dark Mode Lösung mit drei Modi:
- **Hell**: Immer helles Theme
- **Dunkel**: Immer dunkles Theme  
- **System**: Folgt der System-Einstellung

## Features

✅ **Sofortiger Wechsel** - Kein Neuladen erforderlich  
✅ **Persistierung** - Auswahl wird in localStorage gespeichert  
✅ **System Sync** - Reagiert auf System-Theme Änderungen  
✅ **FOUC Prevention** - Verhindert Flash of Unstyled Content  
✅ **Fehlerbehandlung** - Graceful Fallbacks bei localStorage Problemen  
✅ **TypeScript Support** - Vollständig typisiert  

## Verwendung

### 1. ThemeToggle Komponente verwenden

```tsx
import { ThemeToggle } from './components/ThemeToggle'

function Header() {
  return (
    <header className="bg-white dark:bg-gray-800">
      <ThemeToggle />
    </header>
  )
}
```

### 2. useTheme Hook verwenden

```tsx
import { useTheme } from './hooks/useTheme'

function MyComponent() {
  const { theme, currentTheme, changeTheme, isDark } = useTheme()
  
  return (
    <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <p>Aktuelles Theme: {currentTheme}</p>
      <button onClick={() => changeTheme('dark')}>
        Zu Dunkel wechseln
      </button>
    </div>
  )
}
```

### 3. Tailwind Dark Mode Klassen

```tsx
// Basis Dark Mode Klassen
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <h1 className="text-2xl font-bold">Titel</h1>
  <p className="text-gray-600 dark:text-gray-400">Beschreibung</p>
</div>

// Komplexere Beispiele
<button className="
  bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700
  text-white font-medium py-2 px-4 rounded-lg
  transition-colors duration-200
">
  Klick mich
</button>
```

## Konfiguration

### Tailwind Config
```ts
// tailwind.config.ts
export default {
  darkMode: 'class', // Wichtig für class-basiertes Dark Mode
  // ... rest der Konfiguration
}
```

### CSS Setup
```css
/* src/index.css */
@import "tailwindcss";

/* Dark Mode Unterstützung */
.dark {
  color-scheme: dark;
}

.light {
  color-scheme: light;
}

/* Smooth Transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
```

### HTML Setup
```html
<!-- index.html -->
<script>
  // Verhindert FOUC
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'system';
      const root = document.documentElement;
      
      if (theme === 'light') {
        root.classList.add('light');
      } else if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      }
    } catch (error) {
      // Fallback
      const root = document.documentElement;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  })();
</script>
```

## Best Practices

### 1. Konsistente Farbpalette
```tsx
// Verwende diese Farben für bessere Konsistenz
const colors = {
  background: 'bg-white dark:bg-gray-900',
  surface: 'bg-gray-50 dark:bg-gray-800',
  card: 'bg-white dark:bg-gray-800',
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500'
  },
  border: 'border-gray-200 dark:border-gray-700'
}
```

### 2. Transitionen hinzufügen
```tsx
// Füge immer transition-colors hinzu
<div className="bg-white dark:bg-gray-800 transition-colors">
  {/* Inhalt */}
</div>
```

### 3. Icons und Bilder anpassen
```tsx
// Verwende filter für Icons
<svg className="text-gray-900 dark:text-gray-100">
  {/* Icon */}
</svg>

// Oder separate Icons
{isDark ? <MoonIcon /> : <SunIcon />}
```

## Troubleshooting

### Problem: Dark Mode funktioniert nicht
**Lösung:** Überprüfe ob `darkMode: 'class'` in der Tailwind Config steht

### Problem: FOUC (Flash of Unstyled Content)
**Lösung:** Stelle sicher, dass das Theme Script im `<head>` steht

### Problem: localStorage Fehler
**Lösung:** Die Implementierung hat bereits Fehlerbehandlung - überprüfe die Browser-Konsole

### Problem: System Theme wird nicht erkannt
**Lösung:** Überprüfe ob `window.matchMedia` verfügbar ist

## Erweiterte Features

### Custom Theme Colors
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
          // ... weitere Farben
        }
      }
    }
  }
}
```

### Theme-spezifische Komponenten
```tsx
function ThemedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      rounded-lg p-6 shadow-lg
      transition-colors
    ">
      {children}
    </div>
  )
}
```

## Migration von anderen Dark Mode Lösungen

### Von CSS Custom Properties
```css
/* Alt */
:root {
  --bg-color: white;
  --text-color: black;
}

[data-theme="dark"] {
  --bg-color: black;
  --text-color: white;
}

/* Neu mit Tailwind */
.bg-white.dark\:bg-gray-900
.text-gray-900.dark\:text-gray-100
```

### Von React Context
```tsx
// Alt mit Context
const ThemeContext = createContext()

// Neu mit Hook
const { theme, changeTheme } = useTheme()
```

## Performance Tipps

1. **Vermeide zu viele Transitionen** - Nur für wichtige Elemente
2. **Lazy Loading** - Lade Theme-spezifische Assets bei Bedarf
3. **CSS-in-JS vermeiden** - Nutze Tailwind Klassen für bessere Performance
4. **Debounce Theme Changes** - Bei häufigen Änderungen

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile Browser
- ⚠️ IE11 (kein Support für `prefers-color-scheme`)

## Nächste Schritte

1. **Theme-spezifische Assets** - Verschiedene Bilder für Hell/Dunkel
2. **Animationen** - Smooth Theme-Übergänge
3. **Server-side Rendering** - Theme im HTML vorrendern
4. **Accessibility** - ARIA Labels und Keyboard Navigation 