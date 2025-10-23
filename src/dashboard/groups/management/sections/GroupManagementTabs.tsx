import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconBellRinging, 
  IconFileText, 
  IconTrophy, 
  IconUsers, 
  IconVideo,
  IconLoader
} from "@tabler/icons-react";

import { config } from "config.ts";

// Importar los componentes de cada tab
import AnnouncementsTab from "@/dashboard/groups/management/sections/tabs/AnnouncementsTab";
import EvaluationsTab from "@/dashboard/groups/management/sections/tabs/EvaluationsTab";
//import GradesTab from "@/dashboard/groups/management/sections/tabs/GradesTab";
import ParticipantsTab from "@/dashboard/groups/management/sections/tabs/ParticipantsTab";
import ClassesTab from "@/dashboard/groups/management/sections/tabs/ClassesTab";

interface GroupManagementTabsProps {
  user: any;
  token: string | null;
}

export default function GroupManagementTabs({ user, token }: GroupManagementTabsProps) {
  const [activeTab, setActiveTab] = useState("anuncios");
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<any>(null);

  // Determinar si es docente basado en el role del usuario
  const isTeacher = user?.role === "teacher" || user?.role === "docente";

  // Obtener ID del grupo desde la URL
  const groupId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get("groupId") || "1"
    : "1";

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.getById}`.replace(":id", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar el grupo: ${response.status}`);
      }

      const responseData = await response.json();
      const group = responseData.group || responseData;

      setGroupData({
        id: group.id,
        name: group.name,
        courseName: group.course?.name || group.description || "Sin nombre de curso",
        teacherName: group.participants?.teacher?.full_name || 
                     `${group.participants?.teacher?.first_name} ${group.participants?.teacher?.last_name}` || 
                     "Sin docente asignado",
        teacherPhoto: group.participants?.teacher?.profile_photo || "/academico/images/9440461.webp",
        startDate: group.start_date,
        endDate: group.end_date
      });

    } catch (error) {
      console.error("Error cargando datos del grupo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No se pudo cargar la información del grupo</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* Header del Grupo */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{groupData?.name}</h1>
        <p className="text-muted-foreground text-lg">{groupData?.courseName}</p>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={groupData?.teacherPhoto} />
            <AvatarFallback>
              {groupData?.teacherName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{groupData?.teacherName}</span>
        </div>
      </div>

      {/* Sistema de Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="anuncios" className="gap-2 flex-col sm:flex-row py-2">
            <IconBellRinging className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Anuncios</span>
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" className="gap-2 flex-col sm:flex-row py-2">
            <IconFileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Evaluaciones</span>
          </TabsTrigger>
          <TabsTrigger value="calificaciones" className="gap-2 flex-col sm:flex-row py-2">
            <IconTrophy className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Calificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="participantes" className="gap-2 flex-col sm:flex-row py-2">
            <IconUsers className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Participantes</span>
          </TabsTrigger>
          <TabsTrigger value="clases" className="gap-2 flex-col sm:flex-row py-2">
            <IconVideo className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Clases</span>
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="anuncios" className="mt-6">
          <AnnouncementsTab 
            groupId={groupId} 
            token={token} 
            isTeacher={isTeacher} 
          />
        </TabsContent>

        <TabsContent value="evaluaciones" className="mt-6">
          <EvaluationsTab 
            groupId={groupId} 
            token={token} 
            isTeacher={isTeacher} 
          />
        </TabsContent>

        {/* <TabsContent value="calificaciones" className="mt-6">
          <GradesTab 
            groupId={groupId} 
            token={token} 
            isTeacher={isTeacher}
            userId={user?.id}
          />
        </TabsContent>
        */}

        <TabsContent value="participantes" className="mt-6">
          <ParticipantsTab 
            groupId={groupId} 
            token={token} 
          />
        </TabsContent> 

        <TabsContent value="clases" className="mt-6">
          <ClassesTab 
            groupId={groupId} 
            token={token} 
            isTeacher={isTeacher} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}