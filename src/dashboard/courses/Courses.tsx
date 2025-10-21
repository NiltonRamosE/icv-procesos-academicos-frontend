import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MyCourses from "@/dashboard/courses/sections/MyCourses";
import CourseHistory from "@/dashboard/courses/sections/CourseHistory";
import CreateGroup from "@/dashboard/courses/sections/CreateGroup";
import CreateCourse from "@/dashboard/courses/sections/CreateCourse";

type SectionType = 'historial' | 'crear-grupo' | 'crear-curso' | 'default';

export default function Courses() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('default');
  const [completedGroups, setCompletedGroups] = useState<any[]>([]);

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
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      
      // AGREGAR ESTO - Bloquear acceso a crear-grupo y crear-curso si es student
      if (user?.role === 'student' && (hash === 'crear-grupo' || hash === 'crear-curso')) {
        window.location.hash = '';
        return;
      }
      
      if (hash === 'historial') {
        setActiveSection('historial');
      } else if (hash === 'crear-grupo') {
        setActiveSection('crear-grupo');
      } else if (hash === 'crear-curso') {
        setActiveSection('crear-curso');
      } else {
        setActiveSection('default');
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user?.role]);

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
      <AppSidebar 
        variant="inset" 
        token={token} 
        user={user}
      />
      <SidebarInset>
        <SiteHeader title={
          activeSection === 'historial' ? 'Historial de Cursos' :
          activeSection === 'crear-grupo' && user?.role !== 'student' ? 'Crear Grupo' :
          activeSection === 'crear-curso' && user?.role !== 'student' ? 'Crear Curso' :
          'Mis Cursos'
        }/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {activeSection === 'default' && <MyCourses />}
              {activeSection === 'historial' && <CourseHistory />}
              {activeSection === 'crear-grupo' && user?.role !== 'student' && <CreateGroup token={token} user={user}/>}
              {activeSection === 'crear-curso' && user?.role !== 'student' && <CreateCourse token={token} />}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}