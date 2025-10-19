import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { SiteHeader } from "@/dashboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
// Importar el nuevo componente del catálogo
import CourseCatalog  from "@/dashboard/components/CourseCatalog"

export default function Catalog() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    console.log(t);
    setToken(t ?? null);
    try { setUser(u ? JSON.parse(u) : null); } catch { setUser(null); }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader title="Catálogo de grupos"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {/* AQUÍ VA TU COMPONENTE DEL CATÁLOGO */}
            <CourseCatalog token={token} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}