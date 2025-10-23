import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconLoader } from "@tabler/icons-react";
import { config } from "config.ts";

interface AnnouncementsTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: number;
    full_name: string;
  };
}

export default function AnnouncementsTab({ groupId, token, isTeacher }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, [groupId]);

  const loadAnnouncements = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.getAnnouncements}`.replace(":id", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar anuncios: ${response.status}`);
      }

      const data = await response.json();
      setAnnouncements(data.announcements || data || []);
    } catch (err) {
      console.error("Error cargando anuncios:", err);
      setError(err instanceof Error ? err.message : "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    // TODO: Implementar modal de creación de anuncio
    console.log("Crear nuevo anuncio");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadAnnouncements} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Anuncios del Grupo</h2>
        {isTeacher && (
          <Button onClick={handleCreateAnnouncement}>
            <IconPlus className="h-4 w-4 mr-2" />
            Nuevo Anuncio
          </Button>
        )}
      </div>
      
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay anuncios disponibles
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription>
                  Por {announcement.author.full_name} - {new Date(announcement.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}