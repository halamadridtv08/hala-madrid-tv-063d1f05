
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;      // Admin OR Moderator can access
  requireAdminOnly?: boolean;  // Only Admin can access (security pages)
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireAdminOnly = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isModerator, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="madrid-container py-12">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // For admin-only routes (security), require admin role specifically
  if (requireAdminOnly && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // For admin routes, allow admin OR moderator
  if (requireAdmin && !isModerator) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
