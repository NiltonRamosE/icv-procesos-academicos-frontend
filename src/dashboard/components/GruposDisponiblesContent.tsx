import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconArrowLeft, IconClock, IconCalendar, IconUsers, IconLoader, IconSun, IconMoon, IconSunset, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { config } from "config";

interface Course {
  id: number;
  name: string;
  description: string;
  image: string;
  level: string;
  duration: string;
}

interface Group {
  id: number;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  schedule?: string;
  shift?: "morning" | "afternoon" | "night";
  teacher: {
    id: number;
    name: string;
    photo?: string;
  };
  available_spots: number;
  total_spots: number;
  status: "available" | "full" | "upcoming" | "completed";
  enrolled?: boolean;
}

interface GruposDisponiblesContentProps {
  token: string | null;
}

export default function GruposDisponiblesContent({ token }: GruposDisponiblesContentProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [finishingGroup, setFinishingGroup] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('courseId');
      setCourseId(id);
      
      if (id) {
        loadCourseAndGroups(id);
      }
    }
  }, []);

  const loadCourseAndGroups = async (id: string) => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      // Cargar grupos del curso
      const groupsResponse = await fetch(
        `${config.apiUrl}${config.endpoints.courses.getGroups}`.replace(':id', id),
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!groupsResponse.ok) {
        throw new Error("Error cargando grupos");
      }

      const responseData = await groupsResponse.json();
      console.log("Response data:", responseData);
      
      // Adaptarse a la estructura del endpoint: { course_title, course_id, groups: [...] }
      const groupsArray = Array.isArray(responseData) ? responseData : responseData.groups || [];
      const courseTitle = responseData.course_title;
      
      // Usar datos del endpoint de grupos que ya incluye la información del curso
      setCourse({
        id: parseInt(id),
        name: courseTitle || "Curso sin nombre",
        description: "Descripción no disponible",
        image: "/academico/images/9440461.webp",
        level: "Intermedio",
        duration: "Duración no especificada"
      });

      // Procesar datos de grupos - Adaptado a la nueva estructura
      const processedGroups: Group[] = groupsArray.map((g: any) => ({
        id: g.group_id,
        code: g.group_code,
        name: g.group_name,
        start_date: g.start_date,
        end_date: g.end_date,
        teacher: {
          id: g.teacher?.id || 1,
          name: g.teacher?.full_name || "Instructor",
          photo: g.teacher?.profile_photo || "/academico/images/9440461.webp"
        },
        available_spots: g.available_spots || (g.students ? Math.max(0, 25 - g.students.length) : 0),
        total_spots: g.total_spots || 25,
        status: g.status === 'full' ? 'full' : (g.status === 'open' ? 'available' : 'upcoming'),
        enrolled: g.enrolled || false
      }));

      console.log("Grupos procesados:", processedGroups);
      setGroups(processedGroups);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setMessage({
        type: 'error',
        text: "Error al cargar los grupos. Por favor, intenta nuevamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGroup = async (groupId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas terminar este grupo?")) {
      return;
    }

    setFinishingGroup(groupId);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const response = await fetch(
        `${config.apiUrl}/api/groups/${groupId}/complete`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Error al terminar el grupo");
      }

      setMessage({
        type: 'success',
        text: "Grupo terminado exitosamente"
      });

      // Actualizar el estado del grupo
      setGroups(groups.map(g => 
        g.id === groupId ? { ...g, status: 'completed', enrolled: false } : g
      ));

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error terminando grupo:", error);
      setMessage({
        type: 'error',
        text: "Error al terminar el grupo. Por favor, intenta nuevamente."
      });
    } finally {
      setFinishingGroup(null);
    }
  };

  const handleBackToCatalog = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/academico/dashboard/catalogo';
    }
  };

  const handleGroupClick = (groupId: number) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/academico/dashboard/informacion-grupos?groupId=${groupId}`;
    }
  };

  const getShiftIcon = (shift?: string) => {
    switch (shift) {
      case "morning":
        return <IconSun className="h-5 w-5" />;
      case "afternoon":
        return <IconSunset className="h-5 w-5" />;
      case "night":
        return <IconMoon className="h-5 w-5" />;
      default:
        return <IconClock className="h-5 w-5" />;
    }
  };

  const getShiftColor = (shift?: string) => {
    switch (shift) {
      case "morning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "afternoon":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "night":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Disponible</Badge>;
      case "full":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">Completo</Badge>;
      case "upcoming":
        return <Badge variant="outline">Próximamente</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Terminado</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No se pudo cargar el curso</p>
          <Button onClick={handleBackToCatalog}>Volver al Catálogo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {message && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className="mb-6"
        >
          {message.type === 'success' ? (
            <IconCheck className="h-4 w-4" />
          ) : (
            <IconAlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {message.type === 'success' ? '¡Éxito!' : 'Error'}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button 
        variant="ghost" 
        onClick={handleBackToCatalog}
        className="gap-2"
      >
        <IconArrowLeft className="h-4 w-4" />
        Volver al Catálogo
      </Button>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0">
            <img 
              src={course.image} 
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <CardHeader className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{course.name}</CardTitle>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  {course.description}
                </CardDescription>
              </div>
            </CardHeader>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Grupos Disponibles</h2>
        <p className="text-muted-foreground">
          Selecciona el grupo que mejor se ajuste a tu horario
        </p>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card 
              key={group.id}
              className={`overflow-hidden hover:shadow-lg transition-all group ${
                group.status === 'full' || group.status === 'completed' ? 'opacity-60' : 'cursor-pointer'
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {group.name}
                  </CardTitle>
                  {getStatusBadge(group.status)}
                </div>
                
                {group.shift && (
                  <div className="flex items-center gap-2">
                    <Badge className={getShiftColor(group.shift)}>
                      {getShiftIcon(group.shift)}
                      <span className="ml-2 capitalize">
                        {group.shift === "morning" ? "Mañana" : group.shift === "afternoon" ? "Tarde" : "Noche"}
                      </span>
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Inicio: {new Date(group.start_date).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Fin: {new Date(group.end_date).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.teacher.photo} />
                    <AvatarFallback>
                      {group.teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{group.teacher.name}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <IconUsers className="h-4 w-4" />
                      Cupos disponibles
                    </span>
                    <span className="font-semibold">
                      {group.available_spots}/{group.total_spots}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        group.status === 'full' ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ 
                        width: `${((group.total_spots - group.available_spots) / group.total_spots) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2 flex-wrap">
                {group.status !== 'completed' && (
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleFinishGroup(group.id)}
                    disabled={finishingGroup === group.id}
                    size="sm"
                  >
                    {finishingGroup === group.id ? 'Terminando...' : 'Terminar Grupo'}
                  </Button>
                )}
                <Button 
                  className={group.status !== 'completed' ? "flex-1" : "w-full"}
                  disabled={group.status === 'full' || group.status === 'completed'}
                  onClick={() => group.status !== 'full' && group.status !== 'completed' && handleGroupClick(group.id)}
                  size="sm"
                >
                  {group.status === 'full' ? 'Grupo Completo' : group.status === 'completed' ? 'Terminado' : 'Ver Detalles del Grupo'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold">No hay grupos disponibles</h3>
            <p className="text-muted-foreground">
              Actualmente no hay grupos programados para este curso.
            </p>
            <Button onClick={handleBackToCatalog}>
              Explorar Otros Cursos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}