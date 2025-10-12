import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DepartmentDashboardLayout } from "./components/layout/DepartmentDashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DraftContracts from "./pages/DraftContracts";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import Documents from "./pages/department/Documents";
import Requests from "./pages/department/Requests";
import DepartmentAnalytics from "./pages/department/DepartmentAnalytics";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const rootRoute = createRootRoute({
  component: AppProviders,
});

// Standalone routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

// Legal layout and child routes
const legalLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "legal-layout",
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});

const legalIndexRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/",
  component: Dashboard,
});

const legalDraftRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/draft",
  component: DraftContracts,
});

const legalCreateRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/create",
  component: DraftContracts,
});

const legalTasksRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/tasks",
  component: Tasks,
});

const legalRequestsRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/requests",
  component: Tasks,
});

const legalAnalyticsRoute = createRoute({
  getParentRoute: () => legalLayoutRoute,
  path: "/analytics",
  component: Analytics,
});

// Department layout and child routes
const deptLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/department",
  component: () => (
    <DepartmentDashboardLayout>
      <Outlet />
    </DepartmentDashboardLayout>
  ),
});

const deptDashboardRoute = createRoute({
  getParentRoute: () => deptLayoutRoute,
  path: "dashboard",
  component: DepartmentDashboard,
});

const deptDocumentsRoute = createRoute({
  getParentRoute: () => deptLayoutRoute,
  path: "documents",
  component: Documents,
});

const deptRequestsRoute = createRoute({
  getParentRoute: () => deptLayoutRoute,
  path: "requests",
  component: Requests,
});

const deptAnalyticsRoute = createRoute({
  getParentRoute: () => deptLayoutRoute,
  path: "analytics",
  component: DepartmentAnalytics,
});

// Catch-all not found
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  legalLayoutRoute.addChildren([
    legalIndexRoute,
    legalDraftRoute,
    legalCreateRoute,
    legalTasksRoute,
    legalRequestsRoute,
    legalAnalyticsRoute,
  ]),
  deptLayoutRoute.addChildren([
    deptDashboardRoute,
    deptDocumentsRoute,
    deptRequestsRoute,
    deptAnalyticsRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}


