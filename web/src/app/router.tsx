import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router";
import { lazy } from "react";
import { useUser } from "@/features/auth/context/user-store";

// Lazy loading the different pages

const Dashboard = lazy(() => import("@/features/simulation/routes/dashboard"));
const Scene = lazy(() => import("@/features/simulation/routes/scene"));
const Login = lazy(() => import("@/features/auth/routes/login"));

const ProtectedRoute = () => {
  const { current, isLoading } = useUser();

  if (isLoading) return null;


  if (!current) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    // Protected routes
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "scene/:id",
        element: <Scene />,
      },
      {
        path: "scene",
        element: <Navigate to="scene/new" replace />,
      },
    ],
  },
  // Public routes
  {
    path: "auth/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <div className="p-10 text-center">Error 404- Page Not Found</div>,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
