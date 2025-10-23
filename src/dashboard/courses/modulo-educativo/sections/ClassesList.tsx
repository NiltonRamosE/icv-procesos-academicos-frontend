import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Edit,
  Loader,
  Clock,
  Calendar,
  FileText,
  Users
} from "lucide-react";
import { config } from "config";

interface ClassItem {
  id: number;
  group_id: number;
  class_name: string;
  description: string | null;
  class_date: string;
  start_time: string;
  end_time: string;
  class_status: string;
  created_at: string;
  updated_at: string;
  attendances?: any[];
}

interface ClassesListProps {
  token: string | null;
  groupId: string;
  refreshTrigger: number;
  isTeacher: boolean;
  onClassesUpdated: () => void;
  onEditClass: (classId: number) => void;
}

export default function ClassesList({ 
  token, 
  groupId, 
  refreshTrigger,
  isTeacher,
  onClassesUpdated,
  onEditClass
}: ClassesListProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadClasses();
  }, [refreshTrigger]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.classes.getByGroup}`
        .replace(':groupId', groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las clases");
      }

      const data = await response.json();
      const classesArray = Array.isArray(data) ? data : data.classes || [];
      setClasses(classesArray);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: 'Error al cargar las clases'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
      return;
    }

    setDeletingId(classId);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.classes.delete}`
        .replace(':class', String(classId));

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la clase");
      }

      setMessage({
        type: 'success',
        text: 'Clase eliminada exitosamente'
      });

      setClasses(classes.filter(c => c.id !== classId));
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: 'Error al eliminar la clase'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'COMPLETED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'SCHEDULED': 'Programada',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <Alert 
          variant={message.type === 'error' ? 'destructive' : 'default'}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {message.type === 'success' ? '¡Éxito!' : 'Error'}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Clases del Grupo</CardTitle>
          <CardDescription>
            {classes.length === 0 
              ? "No hay clases programadas aún" 
              : `${classes.length} clase${classes.length !== 1 ? 's' : ''} programada${classes.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay clases programadas. Crea la primera clase arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((classItem) => (
                <div 
                  key={classItem.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-muted rounded-lg flex-shrink-0 mt-0.5">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {classItem.class_name}
                        </h3>
                        <Badge className={getStatusColor(classItem.class_status)}>
                          {getStatusLabel(classItem.class_status)}
                        </Badge>
                      </div>

                      {classItem.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {classItem.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(classItem.class_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                          </span>
                        </div>
                        {classItem.attendances && classItem.attendances.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{classItem.attendances.length} asistencias</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        const groupId = params.get('groupId');
                        window.location.href = `/academico/dashboard/courses/clase?classId=${classItem.id}&groupId=${groupId}`;
                      }}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver Clase</span>
                    </Button>

                    {isTeacher && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClass(classItem.id)}
                          title="Gestionar materiales"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClass(classItem.id)}
                          disabled={deletingId === classItem.id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          title="Eliminar clase"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}