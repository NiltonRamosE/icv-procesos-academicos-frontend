import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { config } from "config";

export default function CourseHistory() {
  const [completedGroups, setCompletedGroups] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCertificate, setDownloadingCertificate] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedGroups = async () => {
      try {
        setLoading(true);
        const t = window.localStorage.getItem("token");
        setToken(t ?? null);

        const userData = window.localStorage.getItem("user");
        const userId = userData ? JSON.parse(userData).id : null;

        if (!userId) {
          toast.error("No se pudo identificar al usuario");
          return;
        }

        // Construir la URL del endpoint
        const endpoint = config.endpoints.groups.getGroupsCompleted.replace(':userId', String(userId));
        const url = `${config.apiUrl}${endpoint}`;

        const tokenWithoutQuotes = t?.replace(/^"|"$/g, '');
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenWithoutQuotes}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los grupos completados');
        }

        const data = await response.json();
        console.log(data.groups);
        if (data.groups && Array.isArray(data.groups)) {
          setCompletedGroups(data.groups);
        } else {
          setCompletedGroups([]);
        }

      } catch (error) {
        console.error('Error fetching completed groups:', error);
        toast.error('Error al cargar los cursos completados');
        setCompletedGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedGroups();
  }, []);

  const handleDownloadCertificate = async (groupId: number, credentialId?: number) => {
    console.log(credentialId);

    if (!credentialId) {
      toast.error('Este curso no tiene un certificado disponible.');
      return;
    }
    
    setDownloadingCertificate(groupId);
    
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      // Construir la URL del endpoint
      const endpoint = config.endpoints.certificates.generate.replace(':credentialId', String(credentialId));
      const url = `${config.apiUrl}${endpoint}`;
      
      console.log('Descargando certificado desde:', url);
      
      // Llamada al endpoint de Laravel
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenWithoutQuotes}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al generar el certificado');
      }

      // Convertir la respuesta a blob (archivo)
      const blob = await response.blob();
      
      // Crear un enlace temporal para descargar el archivo
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `certificado-${groupId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('¡Certificado descargado exitosamente!');
    } catch (error) {
      console.error('Error descargando certificado:', error);
      toast.error(error instanceof Error ? error.message : 'Error al descargar el certificado. Por favor, intenta nuevamente.');
    } finally {
      setDownloadingCertificate(null);
    }
  };

  // Función para obtener el profesor del grupo
  const getTeacher = (participants: any[]) => {
    return participants.find(participant => participant.role === 'teacher')?.user || null;
  };

  // Función para obtener imagen por defecto si no hay course_image
  const getCourseImage = (course: any) => {
    return course.course_image || "/academico/images/default-group-01.webp";
  };

  if (loading) {
    return (
      <section className="px-4 md:px-6 lg:px-10">
        <p className="text-center text-muted-foreground py-12">
          Cargando cursos completados...
        </p>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-6 lg:px-10">
      {completedGroups.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No tienes cursos completados aún.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {completedGroups.map((group) => {
            const teacher = getTeacher(group.participants);
            const courseImage = getCourseImage(group.course);
            return (
              <Card 
                key={group.id} 
                className="overflow-hidden transition-all hover:shadow-lg flex flex-col"
              >
                <div className="aspect-video overflow-hidden cursor-pointer">
                  <img
                    src={courseImage}
                    alt={group.course.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.course.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {teacher && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.profile_photo} />
                        <AvatarFallback>
                          {teacher.full_name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{teacher.full_name}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completado</span>
                      <span className="text-green-600 font-medium">100%</span>
                    </div>
                    <Progress value={100} />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Inicio: {new Date(group.start_date).toLocaleDateString()}</p>
                    <p>Fin: {new Date(group.end_date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => handleDownloadCertificate(group.id, group.credentials?.[0]?.id)}
                    disabled={downloadingCertificate === group.id}
                  >
                    <Download className="h-4 w-4" />
                    {downloadingCertificate === group.id ? 'Descargando...' : 'Certificado'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}