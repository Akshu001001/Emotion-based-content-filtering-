import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-full border border-border/60 bg-card/80 px-5 py-3 text-sm font-medium shadow-soft backdrop-blur-xl">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
