import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  require?: "admin" | "editor";
  fallback?: ReactNode;
}

export function RoleGuard({ children, require, fallback }: RoleGuardProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) return null;

  if (require === "admin" && !can.manageTeam) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
  }

  if (require === "editor" && !can.write) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
