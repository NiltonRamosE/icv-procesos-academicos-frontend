import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { SiteHeader } from "@/dashboard/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ClassesList from "@/dashboard/courses/modulo-educativo/sections/ClassesList";
import ClassForm from "@/dashboard/courses/modulo-educativo/sections/ClassForm";
import ClassMaterialsModal from "@/dashboard/courses/modulo-educativo/sections/ClassMaterialsModal";
import { ArrowLeft } from "lucide-react";
import {config} from "config";
export default function EducationModule() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

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
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("groupId");
    if (!id) return;

    setGroupId(id);
  }, []);

  const handleClassesUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditClass = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleCloseModal = () => {
    setSelectedClassId(null);
  };

  if (!mounted || !groupId) return null;

  const isTeacher = user?.role?.includes('teacher') || user?.role?.includes('admin');

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
              <ClassForm 
                token={token} 
                groupId={groupId}
                onClassAdded={handleClassesUpdate}
                isTeacher={isTeacher}
              />
              <ClassesList 
                token={token} 
                groupId={groupId}
                refreshTrigger={refreshTrigger}
                isTeacher={isTeacher}
                onClassesUpdated={handleClassesUpdate}
                onEditClass={handleEditClass}
              />
            </div>
          </div>
        </div>

        {selectedClassId && (
          <ClassMaterialsModal
            token={token}
            classId={selectedClassId}
            isTeacher={isTeacher}
            onClose={handleCloseModal}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}