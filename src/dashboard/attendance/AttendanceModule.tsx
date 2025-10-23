import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Importar secciones
import TeacherAttendance from "@/dashboard/attendance/sections/TeacherAttendance";
import StudentAttendance from "@/dashboard/attendance/sections/StudentAttendance";

export default function AttendanceModule() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) return null;

  // Determinar si es docente o estudiante
  const isTeacher = user?.role === "teacher" || user?.role === "docente";

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader title="Seguimiento de Asistencia"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex-1 py-4 md:py-6">
              <section className="px-4 md:px-6 lg:px-10">
                {isTeacher ? (
                  <TeacherAttendance token={token} user={user} />
                ) : (
                  <StudentAttendance token={token} user={user} />
                )}
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}