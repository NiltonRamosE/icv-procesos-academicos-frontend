// ClassView.tsx
import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader, AlertCircle, FileType, Presentation, Link2 } from "lucide-react";
import { config } from "config";

// Importar tipos
import { type ClassData, type Material } from "@/dashboard/courses/class/types";

// Importar componentes
import { ClassHeader } from "@/dashboard/courses/class/sections/ClassHeader";
import { VideoGallery } from "@/dashboard/courses/class/sections/VideoGallery";
import { DocumentList } from "@/dashboard/courses/class/sections/DocumentList";

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

  // Cargar token y usuario desde localStorage
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

  // Obtener parámetros de URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cId = params.get("classId");
    const gId = params.get("groupId");
    setClassId(cId);
    setGroupId(gId);
  }, []);

  // Cargar datos cuando tengamos classId y token
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

  // Filtrar materiales por tipo
  const mainImage = materials.find(m => m.type.toUpperCase() === 'IMAGEN') || null;
  const videos = materials.filter(m => m.type.toUpperCase() === 'VIDEO');
  const documents = materials.filter(m => !['IMAGEN', 'VIDEO'].includes(m.type.toUpperCase()));

  // Tipos de documentos
  const documentTypes = [
    { key: 'PDF', label: 'Documentos PDF', icon: FileText, color: 'text-purple-500' },
    { key: 'DOCX', label: 'Documentos Word', icon: FileType, color: 'text-blue-500' },
    { key: 'PPTX', label: 'Presentaciones', icon: Presentation, color: 'text-orange-500' },
    { key: 'XLSX', label: 'Documento de Excel', icon: Link2, color: 'text-cyan-500' },
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
                  <ClassHeader classData={classData} mainImage={mainImage} />

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
                        <>
                          <VideoGallery videos={videos} />
                          
                          {/* Grid de documentos en 2 columnas */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {documentTypes.map(({ key, label, icon, color }) => (
                              <DocumentList
                                key={key}
                                materials={documents}
                                type={key}
                                label={label}
                                icon={icon}
                                color={color}
                              />
                            ))}
                          </div>
                        </>
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