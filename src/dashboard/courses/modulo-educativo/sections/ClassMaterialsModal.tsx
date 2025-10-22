import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Video, 
  BookOpen, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Loader,
  X,
  Upload,
  ChevronLeft
} from "lucide-react";
import { config } from "config";

interface Material {
  id: number;
  class_id: number;
  title: string;
  description: string | null;
  type: string;
  file_url: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface ClassMaterialsModalProps {
  token: string | null;
  classId: number;
  isTeacher: boolean;
  onClose: () => void;
}

export default function ClassMaterialsModal({ 
  token, 
  classId, 
  isTeacher,
  onClose 
}: ClassMaterialsModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "document",
    file_url: "",
    visibility: "public",
  });

  useEffect(() => {
    loadMaterials();
  }, [classId]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.list}`
        .replace(':classId', String(classId));

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTeacher) {
      setMessage({
        type: 'error',
        text: 'Solo los docentes pueden cargar materiales'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.create}`
        .replace(':classId', String(classId));

      const materialData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        file_url: formData.file_url,
        visibility: formData.visibility,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(materialData)
      });

      if (!response.ok) {
        throw new Error("Error al cargar el material");
      }

      const newMaterial = await response.json();

      setMessage({
        type: 'success',
        text: `Material "${formData.title}" cargado exitosamente`
      });

      // Agregar el nuevo material a la lista
      setMaterials([newMaterial, ...materials]);

      // Limpiar formulario
      setFormData({
        title: "",
        description: "",
        type: "document",
        file_url: "",
        visibility: "public",
      });

      setShowForm(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al cargar el material'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este material?")) {
      return;
    }

    setDeletingId(materialId);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.delete}`
        .replace(':classId', String(classId))
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
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.toggleVisibility}`
        .replace(':classId', String(classId))
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Materiales de la Clase</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los recursos educativos de esta sesión
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
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

          {/* Add Material Form */}
          {isTeacher && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full gap-2"
              size="lg"
            >
              <Upload className="h-4 w-4" />
              Agregar Nuevo Material
            </Button>
          )}

          {isTeacher && showForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nuevo Material</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
                <CardDescription>
                  Carga videos, documentos, textos y otros recursos educativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Material *</Label>
                    <Input 
                      id="title"
                      name="title"
                      placeholder="Ej: Introducción a JavaScript"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <textarea 
                      id="description"
                      name="description"
                      placeholder="Describe el contenido del material..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Material *</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Documento</SelectItem>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="image">Imagen</SelectItem>
                          <SelectItem value="exam">Examen</SelectItem>
                          <SelectItem value="assignment">Tarea</SelectItem>
                          <SelectItem value="resource">Recurso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibilidad *</Label>
                      <Select 
                        value={formData.visibility}
                        onValueChange={(value) => handleSelectChange('visibility', value)}
                      >
                        <SelectTrigger id="visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público</SelectItem>
                          <SelectItem value="private">Privado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_url">URL del Archivo *</Label>
                    <Input 
                      id="file_url"
                      name="file_url"
                      type="url"
                      placeholder="https://ejemplo.com/archivo"
                      value={formData.file_url}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Proporciona la URL donde está alojado el archivo
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? "Cargando..." : "Cargar Material"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials List */}
          <Card>
            <CardHeader>
              <CardTitle>Materiales Cargados</CardTitle>
              <CardDescription>
                {materials.length === 0 
                  ? "No hay materiales cargados aún" 
                  : `${materials.length} material${materials.length !== 1 ? 'es' : ''} disponible${materials.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Cargando materiales...</p>
                  </div>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay materiales cargados en esta clase.
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
                            <a 
                              href={material.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              {material.file_url}
                            </a>
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
      </div>
    </div>
  );
}