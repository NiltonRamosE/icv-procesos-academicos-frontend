import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconClipboardCheck, IconChartBar, IconBriefcase } from "@tabler/icons-react";

// Importar secciones
import GraduateSurveys from "@/dashboard/graduates/sections/GraduateSurveys";
import EmploymentProfile from "@/dashboard/graduates/sections/EmploymentProfile";
import AdminStatistics from "@/dashboard/graduates/sections/AdminStatistics";

export default function GraduatesModule() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("surveys");

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

   // Detectar la pestaña desde la URL (hash)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'encuestas') {
        setActiveTab('surveys');
      } else if (hash === 'perfil-laboral') {
        setActiveTab('employment');
      } else if (hash === 'estadisticas') {
        setActiveTab('statistics');
      }
    };

    handleHashChange(); // Ejecutar al cargar
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!mounted) return null;

  // Determinar si es administrador
  const isAdmin = user?.role === "admin" || user?.role === "administrador";

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader title="Seguimiento de Egresados"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <section className="px-4 md:px-6 lg:px-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="surveys" className="gap-2 flex-col sm:flex-row py-2">
                      <IconClipboardCheck className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Encuestas</span>
                    </TabsTrigger>
                    <TabsTrigger value="employment" className="gap-2 flex-col sm:flex-row py-2">
                      <IconBriefcase className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Perfil Laboral</span>
                    </TabsTrigger>
                    {isAdmin && (
                      <TabsTrigger value="statistics" className="gap-2 flex-col sm:flex-row py-2">
                        <IconChartBar className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">Estadísticas</span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="surveys" className="mt-6">
                    <GraduateSurveys token={token} user={user} />
                  </TabsContent>

                  <TabsContent value="employment" className="mt-6">
                    <EmploymentProfile token={token} user={user} />
                  </TabsContent>

                  {isAdmin && (
                    <TabsContent value="statistics" className="mt-6">
                      <AdminStatistics token={token} />
                    </TabsContent>
                  )}
                </Tabs>
              </section>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}