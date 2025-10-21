import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { SiteHeader } from "@/dashboard/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import MaterialsList from "@/dashboard/courses/sections/MaterialsList";
import MaterialsUpload from "@/dashboard/courses/sections/MaterialsUpload";

export default function EducationModule() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    setToken(t ?? null);
    try { 
      setUser(u ? JSON.parse(u) : null); 
    } catch { 
      setUser(null); 
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('groupId');
      setGroupId(id);
    }
  }, []);

  const handleMaterialsUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!mounted || !groupId) return null;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" token={token} user={user} />
      <SidebarInset>
        <SiteHeader title="Módulo Educativo" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 md:px-6 lg:px-10">
              
              {/* Sección de Carga de Materiales */}
              <MaterialsUpload 
                token={token} 
                groupId={groupId}
                onMaterialsAdded={handleMaterialsUpdate}
                isTeacher={user?.role?.includes('teacher') || user?.role?.includes('admin')}
              />

              {/* Sección de Listado de Materiales */}
              <MaterialsList 
                token={token} 
                groupId={groupId}
                refreshTrigger={refreshTrigger}
                isTeacher={user?.role?.includes('teacher') || user?.role?.includes('admin')}
                onMaterialsUpdated={handleMaterialsUpdate}
              />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}