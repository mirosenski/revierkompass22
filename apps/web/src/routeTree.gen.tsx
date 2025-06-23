import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { WizardHome } from './components/wizard/WizardHome';
import Shell from './app/layout';

// Create root route
const rootRoute = createRootRoute({
  component: Shell,
});

// Create index route (home/wizard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WizardHome,
});

// Create the route tree
export const routeTree = rootRoute.addChildren([indexRoute]);

// Create and export router
export const router = createRouter({ routeTree });

// Export router type for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
