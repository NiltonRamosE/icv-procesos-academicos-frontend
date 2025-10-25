// src/admin/components/AdminRoute.tsx
import React, { useEffect, useState } from 'react';

interface User {
  role?: string | string[];
  roles?: string[];
}

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdmin = (): void => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user: User = JSON.parse(userStr);
          const userIsAdmin = user?.role?.includes('admin') || user?.roles?.includes('admin');
          setIsAdmin(!!userIsAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder al panel de administración.
          </p>
          <a 
            href="/academico/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}