import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IconPlus, 
  IconLoader, 
  IconVideo, 
  IconCalendar, 
  IconClock,
  IconMapPin,
  IconUsers,
  IconEdit,
  IconTrash
} from "@tabler/icons-react";
import { config } from "config";

interface ClassesTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
}

interface ClassItem {
  id: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  meeting_url?: string;
  class_status: string;
  location?: string;
}

export default function ClassesTab({ groupId, token, isTeacher }: ClassesTabProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, [groupId]);

  const loadClasses = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.classes.getByGroup}`.replace(":groupId", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar clases: ${response.status}`);
      }

      const data = await response.json();
      setClasses(data.classes || data || []);
    } catch (err) {
      console.error("Error cargando clases:", err);
      setError(err instanceof Error ? err.message : "Error al cargar clases");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    // TODO: Implementar modal de creación de clase
    console.log("Crear nueva clase");
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      // Combinar fecha y hora
      const dateTimeStr = `${dateString.split('T')[0]}T${timeString.split('T')[1] || timeString}`;
      const date = new Date(dateTimeStr);
      
      // Formatear fecha
      const formattedDate = date.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Formatear hora
      const formattedTime = date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return {
        date: formattedDate,
        time: formattedTime,
        fullDate: date.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return {
        date: 'Fecha inválida',
        time: 'Hora inválida',
        fullDate: 'Fecha inválida'
      };
    }
  };

  // Función para calcular duración
  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (durationHours > 0) {
        return `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}m` : ''}`;
      }
      return `${durationMinutes}m`;
    } catch (error) {
      return 'Duración no disponible';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      'scheduled': { label: 'Programada', variant: 'default', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'in_progress': { label: 'En Progreso', variant: 'secondary', color: 'bg-green-100 text-green-800 border-green-200' },
      'completed': { label: 'Completada', variant: 'outline', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      'cancelled': { label: 'Cancelada', variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    return (
      <Badge variant={statusInfo.variant} className={`${statusInfo.color} font-medium`}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Ordenar clases por fecha (más recientes primero)
  const sortedClasses = [...classes].sort((a, b) => 
    new Date(b.class_date).getTime() - new Date(a.class_date).getTime()
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando clases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Button onClick={loadClasses} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clases Programadas</h2>
          <p className="text-muted-foreground mt-1">
            {sortedClasses.length} {sortedClasses.length === 1 ? 'clase' : 'clases'} en total
          </p>
        </div>
        {isTeacher && (
          <Button onClick={handleCreateClass} className="flex items-center gap-2">
            <IconPlus className="h-4 w-4" />
            Programar Clase
          </Button>
        )}
      </div>

      {/* Lista de Clases */}
      {sortedClasses.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <IconVideo className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-muted-foreground">No hay clases programadas</h3>
              <p className="text-muted-foreground mt-1">
                {isTeacher 
                  ? "Comienza programando la primera clase del grupo" 
                  : "Aún no hay clases programadas para este grupo"
                }
              </p>
            </div>
            {isTeacher && (
              <Button onClick={handleCreateClass} className="mt-4">
                <IconPlus className="h-4 w-4 mr-2" />
                Crear Primera Clase
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedClasses.map((classItem) => {
            const dateTime = formatDateTime(classItem.class_date, classItem.start_time);
            const endTime = formatDateTime(classItem.class_date, classItem.end_time);
            const duration = calculateDuration(classItem.start_time, classItem.end_time);

            return (
              <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <IconVideo className="h-5 w-5 text-primary" />
                          {classItem.class_name}
                        </CardTitle>
                        {getStatusBadge(classItem.class_status)}
                      </div>
                      
                      {classItem.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {classItem.description}
                        </p>
                      )}
                    </div>
                    
                    {isTeacher && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Fecha y Hora */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconCalendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dateTime.fullDate}</p>
                        <p className="text-muted-foreground">
                          {dateTime.time} - {endTime.time} • {duration}
                        </p>
                      </div>
                    </div>

                    {/* Ubicación/Enlace */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {classItem.meeting_url ? (
                          <IconVideo className="h-5 w-5 text-blue-600" />
                        ) : (
                          <IconMapPin className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {classItem.meeting_url ? 'Clase Virtual' : (classItem.location || 'Presencial')}
                        </p>
                        <p className="text-muted-foreground">
                          {classItem.meeting_url ? 'Enlace disponible' : (classItem.location ? 'Ubicación específica' : 'Por definir')}
                        </p>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <IconUsers className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Estado</p>
                        <div className="mt-1">
                          {getStatusBadge(classItem.class_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  {classItem.meeting_url && (
                    <Button asChild className="w-full md:w-auto" variant="default">
                      <a 
                        href={classItem.meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <IconVideo className="h-4 w-4" />
                        Unirse a la Clase
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}