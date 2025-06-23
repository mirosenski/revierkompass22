# RevierKompass Architecture

**Author**: mirosens

This document provides a detailed overview of the system architecture for the RevierKompass PWA, a modern application for finding optimal routes to police stations in Baden-Württemberg.

## 1. System Overview and Design Principles

RevierKompass is a Progressive Web Application (PWA) designed to provide a fast, reliable, and intuitive experience for users needing to find and navigate to police facilities. The application is built on a set of core design principles:

- **Performance First**: Every architectural decision prioritizes speed and responsiveness. The goal is a sub-150kB initial JavaScript load, ensuring the application is usable on slow networks and low-powered devices.
- **Modularity and Scalability**: The system is designed as a monorepo with distinct, well-defined packages, allowing for independent development, testing, and scaling of different application parts.
- **Resilience and Offline Capability**: As a PWA, the application provides a reliable experience even with intermittent or no network connectivity. It leverages service workers to cache assets and application data.
- **Developer Experience**: A streamlined development environment using modern tools like Vite, Turborepo, and Biome ensures that new developers can quickly become productive.

The user experience is centered around a 3-step wizard that guides the user from entering their location to viewing the optimal routes to nearby police stations on a map.

## 2. Technology Stack

The technology stack was chosen to meet the demands of a modern, high-performance web application.

| Category          | Technology                                       | Version | Rationale                                                                                             |
| ----------------- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------- |
| **Frontend**      | [React](https://react.dev/)                      | 19      | The leading UI library for building interactive and component-based user interfaces.                  |
| **Language**      | [TypeScript](https://www.typescriptlang.org/)    | 5.7     | Provides static typing, improving code quality, maintainability, and developer experience.            |
| **Build Tool**    | [Vite](https://vitejs.dev/)                      | 6       | Offers a significantly faster development experience with near-instant Hot Module Replacement (HMR).      |
| **Routing**       | [TanStack Router](https://tanstack.com/router/)  | -       | A fully type-safe router that provides excellent performance and search-param based state management. |
| **State Mgmt**    | [TanStack Query](https://tanstack.com/query/)    | -       | Manages server state, caching, and data fetching, simplifying data synchronization.                |
|                   | [Zustand](https://zustand-demo.pmnd.rs/)         | -       | A small, fast, and scalable client state management solution with a minimal API.                      |
| **Mapping**       | [MapLibre GL JS](https://maplibre.org/)          | -       | A community-driven, open-source library for rendering interactive maps from vector tiles.             |
| **Monorepo Mgmt** | [Turborepo](https://turbo.build/repo)            | -       | A high-performance build system for JavaScript/TypeScript monorepos, enabling efficient caching and parallel execution. |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/)         | -       | A utility-first CSS framework for rapid UI development without writing custom CSS.                    |
| **Code Quality**  | [Biome](https://biomejs.dev/)                    | -       | An extremely fast formatter and linter, unifying the toolchain for code consistency.                  |
| **Package Mgmt**  | [pnpm](https://pnpm.io/)                         | -       | A fast and disk-space-efficient package manager, ideal for monorepo setups.                           |

## 3. Monorepo Structure and Package Organization

The codebase is organized as a monorepo using pnpm workspaces and managed by Turborepo. This structure enhances code sharing, simplifies dependency management, and streamlines the build process.

```
/
├── apps/
│   └── web/            # The main PWA application
├── packages/
│   ├── api-contracts/  # Shared TypeScript types and Zod schemas for API interactions
│   ├── data/           # Data processing scripts and static data assets
│   ├── routing/        # Logic for interacting with OSRM and Valhalla routing engines
│   └── ui/             # Shared React UI components (e.g., buttons, cards)
└── package.json
```

- **`apps/web`**: The main Next.js application that consumes all the packages. It handles page rendering, routing, and the overall application structure.
- **`packages/api-contracts`**: Defines the data structures and validation schemas (using Zod) for all external and internal API communication. This ensures type safety across the entire stack.
- **`packages/data`**: Contains the raw and processed data for police stations (`polizei-adressen.csv`), along with scripts to parse and prepare this data for the application.
- **`packages/routing`**: Abstracts the logic for calculating routes. It provides a unified interface to query both OSRM and Valhalla, allowing for parallel route calculations and fallback mechanisms.
- **`packages/ui`**: A collection of shared, stateless React components styled with Tailwind CSS, ensuring a consistent look and feel across the application.

## 4. Data Flow and State Management

The application employs a dual-strategy for state management, leveraging the strengths of TanStack Query and Zustand.

![Data Flow Diagram](https://i.imgur.com/example.png)  <!-- Placeholder for a diagram -->

- **Server State (TanStack Query)**: All interactions with external APIs (geocoding, routing) are managed by TanStack Query. It handles caching, refetching, and background updates automatically, providing a responsive and resilient user experience. For example, geocoding results are cached to prevent redundant API calls.
- **Client State (Zustand)**: The state of the UI, particularly the multi-step wizard, is managed by a central Zustand store. This includes the user's current step, form inputs, and selected options. Zustand was chosen for its simplicity, minimal boilerplate, and excellent performance.

**Data Flow Example (Wizard)**:
1.  **Step 1**: User enters an address. `useGeocoding` (a hook using TanStack Query) fetches coordinates from Nominatim/Photon.
2.  On success, the coordinates are stored in the Zustand store, and the UI proceeds to the next step.
3.  **Step 2**: The user selects police stations. The selection is tracked in the Zustand store.
4.  **Step 3**: `useRouteCalculation` (a hook using TanStack Query) is triggered. It reads the start coordinates and selected stations from the Zustand store and calls the `routing` package to fetch routes from OSRM and Valhalla in parallel.
5.  The results are stored in TanStack Query's cache and reflected in the UI, displaying the routes on the MapLibre map.

## 5. API Design and Service Integration

The application integrates with several external services to provide its core functionality.

- **Geocoding**:
  - **Nominatim (OSM)**: Primary geocoding service.
  - **Photon**: Fallback geocoding service for improved address lookup.
  - The `useGeocoding` hook intelligently queries these services to find the most accurate location.
- **Routing**:
  - **OSRM (Open Source Routing Machine)**: Primary, fast routing engine.
  - **Valhalla**: Secondary routing engine providing alternative routes.
  - The `routing` package sends requests to both services simultaneously and aggregates the results, providing the user with multiple routing options.

The `api-contracts` package is crucial for ensuring that the data exchanged with these services is type-safe and valid.

## 6. Performance Optimization Strategies

Performance is a key feature of RevierKompass.

- **Code Splitting**: The application is structured to load only the necessary JavaScript for the current view. The wizard's steps and heavy libraries like MapLibre are loaded dynamically.
- **PWA Caching**: A service worker aggressively caches all static assets and application bundles. It also implements a stale-while-revalidate strategy for API data, allowing the app to work offline.
- **Bundle Size Reduction**: With a target of <150kB for the initial JS load, dependencies are carefully chosen, and tree-shaking is heavily utilized.
- **Image Optimization**: Assets are optimized and served in modern formats.
- **Memoization**: React.memo and useMemo are used strategically to prevent unnecessary re-renders in complex components like the map view.

## 7. Security Considerations

- **Third-Party Services**: All communication with external APIs (Nominatim, OSRM) is done over HTTPS.
- **Data Sanitization**: User input is sanitized before being used in API requests to prevent injection attacks.
- **CORS**: The backend services (if any were used beyond the demo) would need a strict Cross-Origin Resource Sharing (CORS) policy.
- **Dependency Management**: A tool like `pnpm audit` is used to monitor and patch vulnerabilities in third-party dependencies.

## 8. Deployment Architecture

The RevierKompass PWA is deployed as a static site, which is ideal for performance and scalability.

- **Hosting**: The live application is hosted at `https://xcvzzjb3b4.space.minimax.io`. The static files (`HTML`, `CSS`, `JS`) are served via a high-performance CDN.
- **Build Process**: The `pnpm build` command, orchestrated by Turborepo, compiles the TypeScript, bundles the assets, and generates the production-ready static files in the `apps/web/dist` directory.
- **CI/CD**: A continuous integration and deployment pipeline (e.g., using GitHub Actions) automates the process of testing, building, and deploying the application upon pushes to the `main` branch.
