import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, 
  Video, 
  BookOpen, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Edit,
  Lock,
  Eye,
  EyeOff,
  Loader
} from "lucide-react";
import { config } from "config";

interface Material {
  id: number;
  title: string;
  description: string | null;
  type: string;
  file_url: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface MaterialsListProps {
  token: string | null;
  groupId: string;
  refreshTrigger: number;
  isTeacher: boolean;
  onMaterialsUpdated: () => void;
}

export default function MaterialsList({ 
  token, 
  groupId, 
  refreshTrigger,
  isTeacher,
  onMaterialsUpdated 
}: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [refreshTrigger]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.educationalMaterials.getByGroup}`
        .replace(':groupId', groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los materiales");
      }

      const data = await response.json();
      const materialsArray = Array.isArray(data) ? data : data.materials || [];
      setMaterials(materialsArray);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: 'Error al cargar los materiales'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este material?")) {
      return;
    }

    setDeletingId(materialId);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.educationalMaterials.delete}`
        .replace(':groupId', groupId)
        .replace(':materialId', String(materialId));

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el material");
      }

      setMessage({
        type: 'success',
        text: 'Material eliminado exitosamente'
      });

      setMaterials(materials.filter(m => m.id !== materialId));
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: 'Error al eliminar el material'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (materialId: number, currentVisibility: string) => {
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.educationalMaterials.toggleVisibility}`
        .replace(':groupId', groupId)
        .replace(':materialId', String(materialId));

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visibility: currentVisibility === 'public' ? 'private' : 'public'
        })
      });

      if (!response.ok) {
        throw new Error("Error al cambiar visibilidad");
      }

      // Actualizar el material localmente
      setMaterials(materials.map(m => 
        m.id === materialId 
          ? { ...m, visibility: currentVisibility === 'public' ? 'private' : 'public' }
          : m
      ));

      setMessage({
        type: 'success',
        text: 'Visibilidad actualizada'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: 'Error al cambiar visibilidad'
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'document':
      case 'exam':
      case 'assignment':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'text':
      case 'resource':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'video': 'Video',
      'document': 'Documento',
      'text': 'Texto',
      'image': 'Imagen',
      'exam': 'Examen',
      'assignment': 'Tarea',
      'resource': 'Recurso'
    };
    return labels[type.toLowerCase()] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'exam':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'assignment':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'document':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando materiales...</p>
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
          <CardTitle>Materiales Educativos</CardTitle>
          <CardDescription>
            {materials.length === 0 
              ? "No hay materiales cargados aún" 
              : `${materials.length} material${materials.length !== 1 ? 'es' : ''} disponible${materials.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay materiales cargados. Carga el primer material arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div 
                  key={material.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-muted rounded-lg flex-shrink-0 mt-0.5">
                      {getTypeIcon(material.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {material.title}
                        </h3>
                        <Badge className={getTypeColor(material.type)}>
                          {getTypeLabel(material.type)}
                        </Badge>
                        {material.visibility === 'private' && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                      </div>

                      {material.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {material.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>Creado: {formatDate(material.created_at)}</span>
                        {material.updated_at !== material.created_at && (
                          <span>Editado: {formatDate(material.updated_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(material.id, material.visibility)}
                        title={material.visibility === 'public' ? 'Hacer privado' : 'Hacer público'}
                      >
                        {material.visibility === 'public' ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(material.id)}
                        disabled={editingId === material.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material.id)}
                        disabled={deletingId === material.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}