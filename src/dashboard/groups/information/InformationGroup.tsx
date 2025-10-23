// src/dashboard/groups/information/InformationGroup.tsx
import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { config } from "config";
import GroupHeader from "@/dashboard/groups/information/sections/GroupHeader";
import GroupStats from "@/dashboard/groups/information/sections/GroupStats";
import ParticipantsList from "@/dashboard/groups/information/sections/ParticipantsList";
import ClassesList from "@/dashboard/groups/information/sections/ClassesList";
import RecommendedCourses from "@/dashboard/groups/information/sections/RecommendedCourses";
import { type Group, type Participant, type Class } from "@/dashboard/groups/information/types";
import { description } from "@/dashboard/components/chart-area-interactive";

export default function InformationGroup() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!mounted || !token) return;
    fetchGroupData();
  }, [mounted, token]);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(window.location.search);
      const groupId = params.get("groupId") || "1";

      const tokenWithoutQuotes = token!.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.getById}`.replace(":id", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al cargar el grupo: ${response.status}`);
      }

      const responseData = await response.json();
      const groupData = responseData.group || responseData;
      console.log("groupData: ", groupData)
      // Procesar participantes
      const participants: Participant[] = [];

      if (groupData.participants?.teacher) {
        const teacher = groupData.participants.teacher;
        participants.push({
          id: teacher.id,
          name: teacher.full_name || `${teacher.first_name} ${teacher.last_name}`,
          full_name: teacher.full_name || `${teacher.first_name} ${teacher.last_name}`,
          role: "Instructor",
          expertise_area: undefined,
        });
      }

      if (Array.isArray(groupData.participants?.students)) {
        groupData.participants.students.forEach((student: any) => {
          participants.push({
            id: student.id,
            name: student.name || student.full_name || `Estudiante ${student.id}`,
            full_name: student.name || student.full_name || `Estudiante ${student.id}`,
            role: student.role || "Estudiante",
            expertise_area: student.expertise_area,
          });
        });
      }
      console.log("clases: ",groupData.classes);
      const classes: Class[] = (groupData.classes || []).map((cls: any) => ({
        id: cls.id,
        class_name: cls.class_name,
        class_date: cls.class_date,
        start_time: cls.start_time,
        end_time: cls.end_time,
        description: cls.description,
        class_status: cls.class_status,
      }));

      const processedGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description || "Sin descripción disponible",
        status: groupData.status || "Pendiente",
        start_date: groupData.start_date,
        end_date: groupData.end_date,
        participants,
        classes,
        previous_courses: groupData.previous_courses || [],
      };

      setGroup(processedGroup);
    } catch (err) {
      console.error("Error fetching group:", err);
      setError(err instanceof Error ? err.message : "Error al cargar el grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGroups = () => {
    window.location.href = "/academico/dashboard/grupos-disponibles";
  };

  if (!mounted || loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" token={token} user={user} />
        <SidebarInset>
          <SiteHeader title="Información de Grupos" />
          <div className="flex flex-1 flex-col bg-[#0f0f02]">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#848282]/20 border-t-purple-500 mb-4"></div>
                <p className="text-[#848282] text-lg">Cargando información del grupo...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !group) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" token={token} user={user} />
        <SidebarInset>
          <SiteHeader title="Información de Grupos" />
          <div className="flex flex-1 flex-col bg-[#0f0f02]">
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <p className="text-red-400 text-lg">{error || "No se pudo cargar el grupo"}</p>
                <button onClick={handleBackToGroups} className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all border border-blue-500/30">
                  Volver a Mis Grupos
                </button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" token={token} user={user} />
      <SidebarInset>
        <SiteHeader title="Información de Grupos" />
        <div className="flex flex-1 flex-col bg-[#0f0f02]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <section className="px-4 pb-8 md:px-8 lg:px-10">
                <div className="max-w-7xl mx-auto space-y-6">
                  
                  <GroupHeader 
                    group={group} 
                    user={user}
                    token={token}
                    onBack={handleBackToGroups}
                    onRefresh={fetchGroupData}
                  />

                  <GroupStats group={group} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ParticipantsList participants={group.participants} />
                    <ClassesList classes={group.classes} />
                  </div>

                  <div className="bg-gradient-to-r from-[#201a2f]/50 to-[#111115]/50 rounded-xl p-6 border border-[#848282]/20">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">¿Buscas otro grupo?</h3>
                        <p className="text-sm text-[#848282]">Explora todos tus grupos de capacitación</p>
                      </div>
                      <button onClick={handleBackToGroups} className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all border border-blue-500/30 hover:border-blue-500/50">
                        Ver Todos los Grupos
                      </button>
                    </div>
                  </div>

                  {group.previous_courses && group.previous_courses.length > 0 && (
                    <RecommendedCourses courses={group.previous_courses} />
                  )}

                </div>
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}