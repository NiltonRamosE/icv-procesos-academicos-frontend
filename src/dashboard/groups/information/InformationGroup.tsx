import { useState, useEffect } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SectionCards } from "@/dashboard/components/section-cards";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Calendar, Clock, Users, BookOpen, CheckCircle2, User, GraduationCap, Award, ArrowLeft, MoreVertical, Edit, Trash2 } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  participants: { id: number; name: string; role: string; expertise_area?: string }[];
  classes: { id: number; class_name: string; class_date: string; start_time: string; end_time: string }[];
}

export default function InformationGroup() {
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Simulación: en producción esto vendría de la API con el ID del grupo
    const fetchGroupData = async () => {
      // const groupId = window.location.pathname.split('/').pop();
      // const response = await fetch(`/api/groups/${groupId}`);
      // const data = await response.json();
      
      const data = {
        id: 1,
        name: "Grupo de Capacitación en Desarrollo Web",
        description: "Este grupo está dedicado a enseñar habilidades en desarrollo web, incluyendo HTML, CSS, JavaScript, y frameworks modernos.",
        status: "Aprobado",
        start_date: "2025-10-20",
        end_date: "2025-12-20",
        participants: [
          { id: 3, name: "Carlos López", role: "Instructor", expertise_area: "Desarrollo Frontend" },
          { id: 1, name: "Juan Pérez", role: "Estudiante" },
          { id: 2, name: "Ana Gómez", role: "Estudiante" },
          { id: 4, name: "María Rodríguez", role: "Estudiante" },
          { id: 5, name: "Pedro Martínez", role: "Estudiante" },
        ],
        classes: [
          { id: 1, class_name: "Introducción a HTML", class_date: "2025-10-21", start_time: "10:00", end_time: "12:00" },
          { id: 2, class_name: "CSS y Diseño Web", class_date: "2025-10-22", start_time: "14:00", end_time: "16:00" },
          { id: 3, class_name: "JavaScript Básico", class_date: "2025-10-23", start_time: "10:00", end_time: "12:00" },
          { id: 4, class_name: "React Fundamentals", class_date: "2025-10-24", start_time: "14:00", end_time: "16:00" },
        ]
      };
      setGroup(data);
    };

    fetchGroupData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprobado':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pendiente':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'rechazado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleBackToGroups = () => {
    // Navegar de vuelta a la lista de grupos
    // window.location.href = '/groups';
    console.log('Volver a la lista de grupos');
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[#0f0f02]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              
              <section className="px-4 pb-8 md:px-8 lg:px-10">
                {mounted && group ? (
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
                      {/* Efecto de brillo sutil */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
                      
                      <div className="relative">
                        {/* Badge de grupo */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">Grupo #{group.id}</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                              {group.name}
                            </h1>
                            <p className="text-[#848282] text-base md:text-lg leading-relaxed mb-4">
                              {group.description}
                            </p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${getStatusColor(group.status)}`}>
                              <CheckCircle2 className="w-4 h-4" />
                              {group.status}
                            </div>
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
                          <span className="text-sm font-medium text-[#848282]">Inicio</span>
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
                          <span className="text-sm font-medium text-[#848282]">Fin</span>
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
                          <span className="text-sm font-medium text-[#848282]">Miembros</span>
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
                          <span className="text-sm font-medium text-[#848282]">Clases</span>
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
                              <h3 className="text-lg font-semibold text-white">Participantes</h3>
                            </div>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                              {group.participants.length}
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-[#848282]/10 max-h-96 overflow-y-auto">
                          {group.participants
                            .sort((a, b) => (a.role === "Instructor" ? -1 : 1))
                            .map((participant) => (
                              <div 
                                key={participant.id} 
                                className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-full flex-shrink-0 transition-all ${
                                      participant.role === "Instructor" 
                                        ? "bg-purple-500/20 group-hover:bg-purple-500/30" 
                                        : "bg-[#848282]/20 group-hover:bg-[#848282]/30"
                                    }`}>
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
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                                    participant.role === "Instructor" 
                                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                                      : "bg-[#848282]/20 text-[#848282] border-[#848282]/30"
                                  }`}>
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
                              <h3 className="text-lg font-semibold text-white">Clases</h3>
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
                                    <span>{formatDate(classItem.class_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[#848282]">
                                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    <span>{classItem.start_time} - {classItem.end_time}</span>
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
                          <h3 className="text-lg font-semibold text-white mb-1">¿Buscas otro grupo?</h3>
                          <p className="text-sm text-[#848282]">Explora todos tus grupos de capacitación</p>
                        </div>
                        <button 
                          onClick={handleBackToGroups}
                          className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-all border border-blue-500/30 hover:border-blue-500/50"
                        >
                          Ver Todos los Grupos
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#848282]/20 border-t-purple-500 mb-4"></div>
                      <p className="text-[#848282] text-lg">Cargando información del grupo...</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}