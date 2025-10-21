import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckCircle2,
  User,
  GraduationCap,
  Award,
  ArrowLeft,
  MoreVertical,
  Edit,
} from "lucide-react";
import { config } from "config";

interface Participant {
  id: number;
  name: string;
  full_name?: string;
  role: string;
  expertise_area?: string;
}

interface Class {
  id: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
}

interface PreviousCourse {
  previous_course_id: number;
  previous_course_title: string;
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string;
  participants: Participant[];
  classes: Class[];
  previous_courses?: PreviousCourse[];
}

export default function InformationGroup() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
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

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams(window.location.search);
        const groupId = params.get("groupId") || "1";

        const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
        const endpoint =
          `${config.apiUrl}${config.endpoints.groups.getById}`.replace(
            ":id",
            groupId
          );

        console.log("Fetching from:", endpoint);

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
        console.log("Response data:", responseData);

        const groupData = responseData.group || responseData;

        // Procesar participantes
        const participants: Participant[] = [];

        // Agregar profesor
        if (groupData.participants?.teacher) {
          const teacher = groupData.participants.teacher;
          participants.push({
            id: teacher.id,
            name:
              teacher.full_name || `${teacher.first_name} ${teacher.last_name}`,
            full_name:
              teacher.full_name || `${teacher.first_name} ${teacher.last_name}`,
            role: "Instructor",
            expertise_area: undefined,
          });
        }

        // Agregar estudiantes
        if (Array.isArray(groupData.participants?.students)) {
          groupData.participants.students.forEach((student: any) => {
            participants.push({
              id: student.id,
              name:
                student.name || student.full_name || `Estudiante ${student.id}`,
              full_name:
                student.name || student.full_name || `Estudiante ${student.id}`,
              role: student.role || "Estudiante",
              expertise_area: student.expertise_area,
            });
          });
        }

        // Procesar clases
        const classes: Class[] = (groupData.classes || []).map((cls: any) => ({
          id: cls.id,
          class_name: cls.class_name,
          class_date: cls.class_date,
          start_time: cls.start_time,
          end_time: cls.end_time,
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
        setError(
          err instanceof Error ? err.message : "Error al cargar el grupo"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [mounted, token]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "aprobado":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "open":
      case "pending":
      case "pendiente":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "draft":
      case "rechazado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completado";
      case "open":
        return "Abierto";
      case "draft":
        return "Borrador";
      default:
        return status;
    }
  };

  const handleJoinGroup = async () => {
    if (!token || !group) return;

    setJoining(true); // Cambiar a setJoining

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint =
        `${config.apiUrl}${config.endpoints.groups.join}`.replace(
          ":id",
          group.id.toString()
        );

      console.log("Joining group endpoint:", endpoint); // Para debug

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al unirse al grupo");
      }

      alert("¡Te has unido al grupo exitosamente!");
      window.location.reload();
    } catch (err) {
      console.error("Error joining group:", err);
      alert(err instanceof Error ? err.message : "Error al unirse al grupo");
    } finally {
      setJoining(false); // Cambiar a setJoining
    }
  };

  const handleBackToGroups = () => {
    window.location.href = "/academico/dashboard/grupos-disponibles";
  };

  if (!mounted || loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" token={token} user={user} />
        <SidebarInset>
          <SiteHeader title="Información de Grupos" />
          <div className="flex flex-1 flex-col bg-[#0f0f02]">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#848282]/20 border-t-purple-500 mb-4"></div>
                <p className="text-[#848282] text-lg">
                  Cargando información del grupo...
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !group) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" token={token} user={user} />
        <SidebarInset>
          <SiteHeader title="Información de Grupos" />
          <div className="flex flex-1 flex-col bg-[#0f0f02]">
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <p className="text-red-400 text-lg">
                  {error || "No se pudo cargar el grupo"}
                </p>
                <button
                  onClick={handleBackToGroups}
                  className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all border border-blue-500/30"
                >
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" token={token} user={user} />
      <SidebarInset>
        <SiteHeader title="Información de Grupos" />
        <div className="flex flex-1 flex-col bg-[#0f0f02]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <section className="px-4 pb-8 md:px-8 lg:px-10">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Breadcrumb y acciones */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <button
                      onClick={handleBackToGroups}
                      className="flex items-center gap-2 text-[#848282] hover:text-white transition-colors group"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span className="font-medium">Volver a Mis Grupos</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-[#201a2f] rounded-lg transition-colors border border-[#848282]/20">
                        <Edit className="w-5 h-5 text-[#848282] hover:text-blue-400 transition-colors" />
                      </button>
                      <button className="p-2 hover:bg-[#201a2f] rounded-lg transition-colors border border-[#848282]/20">
                        <MoreVertical className="w-5 h-5 text-[#848282]" />
                      </button>
                    </div>
                  </div>

                  {/* Header con título y estado */}
                  <div className="relative bg-gradient-to-br from-[#201a2f] via-[#111115] to-[#000000] rounded-2xl p-8 md:p-10 border border-[#848282]/20 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>

                    <div className="relative">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400">
                          Grupo #{group.id}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                            {group.name}
                          </h1>
                          <p className="text-[#848282] text-base md:text-lg leading-relaxed mb-4">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${getStatusColor(
                                group.status
                              )}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {getStatusLabel(group.status)}
                            </div>
                          </div>

                          {/* BOTÓN FUERA DEL CONTENEDOR - Después del div anterior */}
                          {(() => {
                            console.log("User:", user);
                            console.log(
                              "Group participants:",
                              group.participants
                            );
                            console.log("User ID:", user?.id);
                            console.log(
                              "Comparison details:",
                              group.participants.map((p) => ({
                                participantId: p.id,
                                participantIdType: typeof p.id,
                                userId: user?.id,
                                userIdType: typeof user?.id,
                                areEqual: p.id === user?.id,
                                areEqualLoose: p.id == user?.id,
                              }))
                            );
                            console.log(
                              "Is user in participants?",
                              group.participants.some((p) => p.id === user?.id)
                            );
                            return null;
                          })()}
                          {user &&
                            !group.participants.some(
                              (p) => p.id === user?.id
                            ) && (
                              <div className="mt-4 relative z-50">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => {
                                    console.log("Button clicked!");
                                    handleJoinGroup();
                                  }}
                                  disabled={joining}
                                >
                                  <Users className="w-4 h-4" />
                                  {joining
                                    ? "Uniéndose..."
                                    : "Unirme a este Grupo"}
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información básica del grupo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-[#848282]">
                          Inicio
                        </span>
                      </div>
                      <p className="text-base font-semibold text-white">
                        {formatDate(group.start_date)}
                      </p>
                    </div>

                    <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-500/40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                          <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-[#848282]">
                          Fin
                        </span>
                      </div>
                      <p className="text-base font-semibold text-white">
                        {formatDate(group.end_date)}
                      </p>
                    </div>

                    <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-500/40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-[#848282]">
                          Miembros
                        </span>
                      </div>
                      <p className="text-base font-semibold text-white">
                        {group.participants.length}
                      </p>
                    </div>

                    <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-500/40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                          <BookOpen className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-[#848282]">
                          Clases
                        </span>
                      </div>
                      <p className="text-base font-semibold text-white">
                        {group.classes.length}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Participantes */}
                    <div className="bg-[#111115] rounded-xl border border-[#848282]/20 shadow-xl overflow-hidden">
                      <div className="bg-[#201a2f] px-6 py-5 border-b border-[#848282]/20">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              Participantes
                            </h3>
                          </div>
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                            {group.participants.length}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-[#848282]/10 max-h-96 overflow-y-auto">
                        {group.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`p-2 rounded-full flex-shrink-0 transition-all ${
                                    participant.role === "Instructor"
                                      ? "bg-purple-500/20 group-hover:bg-purple-500/30"
                                      : "bg-[#848282]/20 group-hover:bg-[#848282]/30"
                                  }`}
                                >
                                  {participant.role === "Instructor" ? (
                                    <GraduationCap className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <User className="w-5 h-5 text-[#848282]" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white text-sm truncate">
                                    {participant.name}
                                  </p>
                                  {participant.expertise_area && (
                                    <p className="text-xs text-[#848282] mt-0.5 truncate">
                                      {participant.expertise_area}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                                  participant.role === "Instructor"
                                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                    : "bg-[#848282]/20 text-[#848282] border-[#848282]/30"
                                }`}
                              >
                                {participant.role}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clases programadas */}
                    <div className="bg-[#111115] rounded-xl border border-[#848282]/20 shadow-xl overflow-hidden">
                      <div className="bg-[#201a2f] px-6 py-5 border-b border-[#848282]/20">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                              <BookOpen className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              Clases
                            </h3>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
                            {group.classes.length}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-[#848282]/10 max-h-96 overflow-y-auto">
                        {group.classes.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group cursor-pointer"
                          >
                            <div className="space-y-3">
                              <h4 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors">
                                {classItem.class_name}
                              </h4>
                              <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 text-[#848282]">
                                  <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <span>
                                    {formatDate(classItem.class_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[#848282]">
                                  <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                  <span>
                                    {classItem.start_time} -{" "}
                                    {classItem.end_time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sección de navegación a otros grupos */}
                  <div className="bg-gradient-to-r from-[#201a2f]/50 to-[#111115]/50 rounded-xl p-6 border border-[#848282]/20">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          ¿Buscas otro grupo?
                        </h3>
                        <p className="text-sm text-[#848282]">
                          Explora todos tus grupos de capacitación
                        </p>
                      </div>
                      <button
                        onClick={handleBackToGroups}
                        className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all border border-blue-500/30 hover:border-blue-500/50"
                      >
                        Ver Todos los Grupos
                      </button>
                    </div>
                  </div>

                  {/* Sección de Cursos Recomendados */}
                  {group.previous_courses &&
                    group.previous_courses.length > 0 && (
                      <div className="bg-gradient-to-br from-[#201a2f] via-[#111115] to-[#000000] rounded-2xl p-8 md:p-10 border border-[#848282]/20 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0"></div>

                        <div className="relative">
                          <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                              Cursos Recomendados
                            </h2>
                            <p className="text-[#848282]">
                              Continúa tu aprendizaje con estos cursos
                              relacionados
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.previous_courses.map((course) => (
                              <div
                                key={course.previous_course_id}
                                className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-500/40 cursor-pointer"
                                onClick={() =>
                                  (window.location.href = `/academico/dashboard/catalogo`)
                                }
                              >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                  <div className="p-2.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                                    <BookOpen className="w-5 h-5 text-amber-400" />
                                  </div>
                                  <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium">
                                    Recomendado
                                  </span>
                                </div>

                                <h3 className="font-semibold text-white text-lg group-hover:text-amber-400 transition-colors mb-3 line-clamp-2">
                                  {course.previous_course_title}
                                </h3>

                                <p className="text-sm text-[#848282] mb-4">
                                  Complementa tu formación con este curso
                                  relacionado
                                </p>

                                <button className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg font-medium transition-all border border-amber-500/30 hover:border-amber-500/50 text-sm">
                                  Ver Curso
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
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
