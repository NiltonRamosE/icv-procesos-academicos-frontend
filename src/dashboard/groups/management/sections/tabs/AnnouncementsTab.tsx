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
  IconCalendar,
  IconEye,
  IconExternalLink,
  
} from "@tabler/icons-react";
import AnnouncementModal from "@/dashboard/groups/management/components/announcement-modal";
import { config } from "config";

interface AnnouncementsTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
  teacherId: number; // Nuevo prop para el ID del docente
}

interface Announcement {
  id: number;
  id_announcement: number;
  title: string;
  content: string;
  image_url: string | null;
  display_type: string | null;
  target_page: string | null;
  link_url: string | null;
  button_text: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  views: number;
  created_by: number | null;
  created_date: string;
  author?: {
    id: number;
    full_name: string;
  };
}

export default function AnnouncementsTab({ groupId, token, isTeacher, teacherId }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [groupId]);

  const loadAnnouncements = async () => {
    // TODO: Reemplazar con llamada real a la API cuando esté disponible
    // try {
    //   const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
    //   const endpoint = `${config.apiUrl}${config.endpoints.groups.getAnnouncements}`.replace(":id", groupId);
    //   const response = await fetch(endpoint, {
    //     method: "GET",
    //     headers: { 
    //       "Authorization": `Bearer ${tokenWithoutQuotes}`,
    //       "Content-Type": "application/json"
    //     }
    //   });
    //   if (!response.ok) throw new Error(`Error al cargar anuncios: ${response.status}`);
    //   const data = await response.json();
    //   setAnnouncements(data.announcements || data || []);
    // } catch (err) {
    //   console.error("Error cargando anuncios:", err);
    //   setError(err instanceof Error ? err.message : "Error al cargar anuncios");
    // } finally {
    //   setLoading(false);
    // }

    // DATOS ESTÁTICOS - Simulando respuesta de la API
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de carga
      
      const staticAnnouncements: Announcement[] = [
        {
          id: 1,
          id_announcement: 1001,
          title: "Bienvenida al Curso de Desarrollo Web",
          content: "¡Bienvenidos a todos al curso de Desarrollo Web Full Stack! 🎉\n\nEstamos emocionados de comenzar este viaje de aprendizaje juntos. En este curso exploraremos las tecnologías fundamentales para el desarrollo web moderno:\n\n• HTML5 y semántica web\n• CSS3 y diseño responsive\n• JavaScript ES6+\n• React y componentes\n• Node.js y backend\n\nRecuerden revisar el material de la primera clase y preparar su entorno de desarrollo. Nos vemos en la primera sesión virtual.",
          image_url: "https://res.cloudinary.com/dshi5w2wt/image/upload/v1761195457/xjjtjo1hym5bqcfrxwlj.png",
          display_type: "banner",
          target_page: "course",
          link_url: "/academico/groups/1",
          button_text: "Ir al Curso",
          status: "published",
          start_date: "2025-01-10T00:00:00Z",
          end_date: "2025-01-20T23:59:59Z",
          views: 45,
          created_by: 2,
          created_date: "2025-01-10T09:00:00Z",
          author: {
            id: 2,
            full_name: "Carlos García"
          }
        },
        {
          id: 2,
          id_announcement: 1002,
          title: "Recordatorio: Examen Parcial Programado",
          content: "Estimados estudiantes,\n\nLes informamos que el examen parcial del módulo de HTML/CSS está programado para el próximo viernes 15 de febrero.\n\nDetalles importantes:\n- Fecha: Viernes 15 de febrero\n- Hora: 09:00 - 11:00 AM\n- Duración: 2 horas\n- Modalidad: Virtual a través de la plataforma\n- Temas: Todos los vistos hasta la clase 8\n\nPrepárense revisando los ejercicios prácticos y los conceptos teóricos vistos en clase. ¡Mucho éxito!",
          image_url: null,
          display_type: "alert",
          target_page: "evaluations",
          link_url: "/academico/groups/1/evaluations",
          button_text: "Ver Evaluaciones",
          status: "published",
          start_date: "2025-02-10T00:00:00Z",
          end_date: "2025-02-15T11:00:00Z",
          views: 32,
          created_by: 2,
          created_date: "2025-02-10T14:30:00Z",
          author: {
            id: 2,
            full_name: "Carlos García"
          }
        },
        {
          id: 3,
          id_announcement: 1003,
          title: "Nuevo Material de Estudio Disponible",
          content: "Hemos agregado nuevo material de estudio para el módulo de JavaScript:\n\n• Guía de arrays y métodos\n• Ejercicios prácticos de funciones\n• Proyecto ejemplo de DOM manipulation\n• Recursos adicionales de ES6+\n\nPueden acceder al material desde la sección de recursos del curso. Recuerden que la práctica constante es clave para el aprendizaje.",
          image_url: "https://res.cloudinary.com/dshi5w2wt/image/upload/v1761192083/el-desarrollo-web_oapcly.webp",
          display_type: "info",
          target_page: "materials",
          link_url: "/academico/groups/1/materials",
          button_text: "Ver Materiales",
          status: "published",
          start_date: "2025-01-25T00:00:00Z",
          end_date: null,
          views: 28,
          created_by: 2,
          created_date: "2025-01-25T10:15:00Z",
          author: {
            id: 2,
            full_name: "Carlos García"
          }
        },
        {
          id: 4,
          id_announcement: 1004,
          title: "Horario de Asesorías Personalizadas",
          content: "A partir de la próxima semana, estaré disponible para asesorías personalizadas:\n\nHorarios disponibles:\n- Lunes y Miércoles: 2:00 PM - 4:00 PM\n- Viernes: 9:00 AM - 11:00 AM\n\nPueden agendar su sesión a través del calendario del curso. Las asesorías son opcionales pero recomendadas para resolver dudas específicas.",
          image_url: null,
          display_type: "schedule",
          target_page: "calendar",
          link_url: "/academico/calendar",
          button_text: "Ver Calendario",
          status: "published",
          start_date: "2025-01-20T00:00:00Z",
          end_date: "2025-03-15T23:59:59Z",
          views: 19,
          created_by: 2,
          created_date: "2025-01-18T16:45:00Z",
          author: {
            id: 2,
            full_name: "Carlos García"
          }
        }
      ];

      setAnnouncements(staticAnnouncements);
    } catch (err) {
      console.error("Error cargando anuncios:", err);
      setError("Error al cargar los anuncios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setIsModalOpen(true);
  };

  const handleAnnouncementCreated = () => {
    loadAnnouncements();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'published': { label: 'Publicado', variant: 'default' },
      'draft': { label: 'Borrador', variant: 'outline' },
      'scheduled': { label: 'Programado', variant: 'secondary' },
      'archived': { label: 'Archivado', variant: 'outline' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDisplayTypeBadge = (displayType: string | null) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline"; color: string }> = {
      'banner': { label: 'Banner', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'alert': { label: 'Alerta', variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'info': { label: 'Informativo', variant: 'outline', color: 'bg-green-100 text-green-800' },
      'schedule': { label: 'Horario', variant: 'outline', color: 'bg-purple-100 text-purple-800' }
    };

    const typeInfo = typeMap[displayType || 'info'] || { label: displayType || 'General', variant: 'outline', color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant={typeInfo.variant} className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = (announcement: Announcement) => {
    const now = new Date();
    const start = announcement.start_date ? new Date(announcement.start_date) : null;
    const end = announcement.end_date ? new Date(announcement.end_date) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return announcement.status === 'published';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando anuncios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Button onClick={loadAnnouncements}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Anuncios del Grupo</h2>
          <p className="text-muted-foreground mt-1">
            {announcements.length} {announcements.length === 1 ? 'anuncio' : 'anuncios'} en total
          </p>
        </div>
        {isTeacher && (
          <Button onClick={handleCreateAnnouncement}>
            <IconPlus className="h-4 w-4 mr-2" />
            Nuevo Anuncio
          </Button>
        )}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnnouncementCreated={handleAnnouncementCreated}
        groupId={groupId}
        token={token}
        teacherId={teacherId}
      />

      {announcements.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="space-y-4">
              <IconCalendar className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-muted-foreground">No hay anuncios</h3>
                <p className="text-muted-foreground mt-2">
                  {isTeacher 
                    ? "Comienza creando el primer anuncio del grupo" 
                    : "Aún no hay anuncios publicados para este grupo"
                  }
                </p>
              </div>
              {isTeacher && (
                <Button onClick={handleCreateAnnouncement} className="mt-4">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Crear Primer Anuncio
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`hover:shadow-lg transition-all ${
                !isActive(announcement) ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        {getStatusBadge(announcement.status)}
                        {getDisplayTypeBadge(announcement.display_type)}
                      </div>
                    </div>
                    
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        Por {announcement.author?.full_name || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconCalendar className="h-4 w-4" />
                        {formatDate(announcement.created_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconEye className="h-4 w-4" />
                        {announcement.views} vistas
                      </span>
                    </CardDescription>

                    {/* Fechas de vigencia */}
                    {(announcement.start_date || announcement.end_date) && (
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {announcement.start_date && (
                          <span>Inicio: {formatDate(announcement.start_date)}</span>
                        )}
                        {announcement.end_date && (
                          <span>Fin: {formatDate(announcement.end_date)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Imagen del anuncio */}
                {announcement.image_url && (
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <img
                      src={announcement.image_url}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <IconExternalLink className="h-3 w-3" />
                        Imagen
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Contenido del anuncio */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>

              {/* Footer con acciones */}
              {(announcement.link_url && announcement.button_text) && (
                <CardFooter>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <a 
                      href={announcement.link_url} 
                      target={announcement.link_url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                    >
                      <IconExternalLink className="h-4 w-4" />
                      {announcement.button_text}
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}