# RevierKompass

> Next-gen Routing-Wizard für Polizeipräsidien mit Offline-PWA Support

## Tech Stack

- **Vite 6** + React 19
- **Tailwind CSS 4 (alpha)** + shadcn/ui
- **MapLibre GL** für Karten
- **TanStack Router** für file-based routing
- **Zustand** für State Management

## Projekt-Struktur
apps/
web/          # Hauptanwendung (Vite + React)
packages/
ui/           # Shared UI Components
config/       # Shared Configs (ESLint, TypeScript)

## Development

```bash
pnpm dev        # Startet alle Apps
pnpm build      # Production Build
pnpm test       # Tests ausführen
