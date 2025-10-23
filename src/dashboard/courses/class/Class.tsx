import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { SiteHeader } from "@/dashboard/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  Video,
  FileText,
  Image,
  FileType,
  Presentation,
  BookOpen,
  ExternalLink,
  Loader,
  AlertCircle,
  Link2
} from "lucide-react";
import { config } from "config";

interface ClassData {
  id: number;
  group_id: number;
  class_name: string;
  description: string | null;
  class_date: string;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  class_status: string;
  created_at: string;
}

interface Material {
  id: number;
  class_id: number;
  material_url: string;
  type: string;
  created_at: string;
}

export default function ClassView() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [classId, setClassId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cId = params.get("classId");
    const gId = params.get("groupId");
    setClassId(cId);
    setGroupId(gId);
  }, []);

  useEffect(() => {
    if (classId && token) {
      loadClassData();
      loadMaterials();
    }
  }, [classId, token]);

  const loadClassData = async () => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const response = await fetch(
        `${config.apiUrl}/api/classes/${classId}`,
        {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) throw new Error("Error al cargar la clase");

      const data = await response.json();
      setClassData(data.data || data);
    } catch (err) {
      setError("Error al cargar los datos de la clase");
      console.error(err);
    }
  };

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.getByClass}`
        .replace(':classId', classId!);

      const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Error al cargar materiales");

      const data = await response.json();
      setMaterials(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'SCHEDULED': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'IN_PROGRESS': 'bg-green-500/10 text-green-500 border-green-500/20',
      'COMPLETED': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return colors[status] || colors['SCHEDULED'];
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

  const getMaterialsByType = (type: string) => {
    return materials.filter(m => m.type.toUpperCase() === type.toUpperCase());
  };

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'VIDEO') return <Video className="h-5 w-5" />;
    if (t === 'PDF') return <FileText className="h-5 w-5" />;
    if (t === 'DOCX' || t === 'DOC') return <FileType className="h-5 w-5" />;
    if (t === 'PPTX' || t === 'PPT') return <Presentation className="h-5 w-5" />;
    if (t === 'IMAGEN' || t === 'JPG' || t === 'PNG') return <Image className="h-5 w-5" />;
    return <BookOpen className="h-5 w-5" />;
  };

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || url;
      return decodeURIComponent(fileName);
    } catch {
      return url;
    }
  };

  const materialTypes = [
    { key: 'PDF', label: 'Documentos PDF', icon: FileText, color: 'text-purple-500' },
    { key: 'DOCX', label: 'Documentos Word', icon: FileType, color: 'text-blue-500' },
    { key: 'PPTX', label: 'Presentaciones', icon: Presentation, color: 'text-orange-500' },
    { key: 'VIDEO', label: 'Videos', icon: Video, color: 'text-red-500' },
    { key: 'IMAGEN', label: 'Imágenes', icon: Image, color: 'text-green-500' },
    { key: 'ENLACE', label: 'Enlaces', icon: Link2, color: 'text-cyan-500' },
  ];

  if (!mounted || !classId) return null;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" token={token} user={user} />
      <SidebarInset>
        <SiteHeader title="Vista de Clase" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-4 md:py-6 px-4 md:px-6 lg:px-10">

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {classData && (
                <>
                  <Card className="border-2">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl">{classData.class_name}</CardTitle>
                          <Badge className={getStatusColor(classData.class_status)}>
                            {getStatusLabel(classData.class_status)}
                          </Badge>
                        </div>
                      </div>

                      {classData.description && (
                        <CardDescription className="text-base">
                          {classData.description}
                        </CardDescription>
                      )}

                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(classData.class_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(classData.start_time)} - {formatTime(classData.end_time)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {classData.meeting_url && (
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Video className="h-5 w-5 text-green-500" />
                          Reunión Virtual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          asChild
                          className="w-full gap-2"
                          size="lg"
                        >
                          <a
                            href={classData.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Unirse a la Reunión
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Materiales de la Clase</CardTitle>
                      <CardDescription>
                        {materials.length === 0 
                          ? "No hay materiales disponibles" 
                          : `${materials.length} material${materials.length !== 1 ? 'es' : ''} disponible${materials.length !== 1 ? 's' : ''}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : materials.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Aún no hay materiales cargados para esta clase
                          </p>
                        </div>
                      ) : (
                        materialTypes.map(({ key, label, icon: Icon, color }) => {
                          const typeMaterials = getMaterialsByType(key);
                          if (typeMaterials.length === 0) return null;

                          return (
                            <div key={key} className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <Icon className={`h-5 w-5 ${color}`} />
                                <h3 className="font-semibold text-lg">{label}</h3>
                                <Badge variant="outline">{typeMaterials.length}</Badge>
                              </div>
                              
                              <div className="grid gap-3">
                                {typeMaterials.map((material) => (
                                  <a
                                    key={material.id}
                                    href={material.material_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div className="p-2 bg-muted rounded-lg">
                                        {getTypeIcon(material.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {getFileName(material.material_url)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(material.created_at).toLocaleDateString('es-ES')}
                                        </p>
                                      </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}