// src/admin/components/AdminLayout.tsx
import React from 'react';
import { AppSidebar } from '@/shared/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  // Manejo seguro del user data
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      if (typeof userData === 'string' && userData.trim().startsWith('{')) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const userData = getUserData();
  const token = getToken();

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-900 w-full">
        {/* Usar el AppSidebar completo existente */}
        <AppSidebar 
          token={token} 
          user={userData}
        />

        {/* CONTENEDOR PRINCIPAL - EXPANDIDO */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header del contenido */}
          <header className="bg-gray-800 border-b border-gray-700 shrink-0 w-full">
            <div className="flex items-center justify-between px-6 py-4 w-full">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-white truncate">{title}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Administro y gestiono los estudiantes del sistema
                </p>
              </div>
              
              {/* Información adicional del header */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm text-gray-300">
                    Hola, <span className="font-medium text-white">
                      {userData ? (userData.first_name || userData.name || 'Admin') : 'Admin'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {userData?.role || 'Administrador'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content - SIN RESTRICCIONES DE ANCHO */}
          <main className="flex-1 bg-gray-900 overflow-auto w-full">
            <div className="w-full max-w-full px-4 lg:px-6 py-4 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}