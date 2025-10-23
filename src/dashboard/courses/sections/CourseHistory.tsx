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
  const [downloadingCertificate, setDownloadingCertificate] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Obtener token del localStorage
    const t = window.localStorage.getItem("token");
    setToken(t ?? null);
    
    // Aquí harías el fetch a tu API
    // fetch(`/api/groups?user_id=${user?.id}&status=completed`)
    setCompletedGroups([
      {
        id: 1,
        name: "Grupo A - Mañana",
        course: {
          name: "Desarrollo Web Fullstack",
          image: "/images/default-group-01.webp"
        },
        teacher: {
          name: "Juan Pérez",
          photo: "/images/9439727.webp"
        },
        start_date: "2023-07-15",
        end_date: "2023-12-15",
        progress: 100,
        credential_id: 1 // ← ID de la credencial/certificado
      },
      {
        id: 2,
        name: "Grupo B - Tarde",
        course: {
          name: "Python Avanzado",
          image: "/images/default-group-02.webp"
        },
        teacher: {
          name: "María González",
          photo: "/images/9439729.webp"
        },
        start_date: "2023-06-01",
        end_date: "2023-11-30",
        progress: 100,
        credential_id: 2 // ← ID de la credencial/certificado
      }
    ]);
  }, []);

  const handleDownloadCertificate = async (groupId: number, credentialId?: number) => {
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
          'Accept': 'application/pdf', // Importante para recibir PDF
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
      link.download = `certificado-credencial-${credentialId}.pdf`; // Nombre del archivo
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

  return (
    <section className="px-4 md:px-6 lg:px-10">
      {completedGroups.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No tienes cursos completados aún.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {completedGroups.map((group) => (
            <Card 
              key={group.id} 
              className="overflow-hidden transition-all hover:shadow-lg flex flex-col"
            >
              <div className="aspect-video overflow-hidden cursor-pointer">
                <img
                  src={group.course.image}
                  alt={group.course.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onClick={() => window.location.href = `/academico/groups/${group.id}`}
                />
              </div>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.course.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.teacher.photo} />
                    <AvatarFallback>
                      {group.teacher.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{group.teacher.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Completado</span>
                    <span className="text-green-600 font-medium">100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
              {group.progress === 100 && (
                <CardFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => handleDownloadCertificate(group.id)}
                  >
                    <Download className="h-4 w-4" />
                    Certificado
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => window.location.href = `/academico/groups/${group.id}`}
                  >
                    Ver Detalles
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}