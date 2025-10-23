import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CloudinaryUploader from "@/services/CloudinaryUploader"
import DriveUploader from "@/services/DriveUploader";

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
  Image, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Loader,
  X,
  Upload,
  ChevronLeft,
  FileType,
  Presentation
} from "lucide-react";
import { config } from "config";

interface Material {
  id: number;
  class_id: number;
  material_url: string;
  type: string;
  created_at: string;
  updated_at: string;
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
    material_url: "",
    type: "PDF",
  });

  useEffect(() => {
    loadMaterials();
  }, [classId]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.getByClass}`
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
      const materialsArray = Array.isArray(data.data) ? data.data : [];
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isTeacher) {
      setMessage({
        type: 'error',
        text: 'Solo los docentes pueden cargar materiales'
      });
      return;
    }

    if (!formData.material_url.trim()) {
      setMessage({
        type: 'error',
        text: 'Debes proporcionar una URL válida'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.materials.create}`
        .replace(':classId', String(classId));

      const materialData = {
        class_id: classId,
        material_url: formData.material_url,
        type: formData.type,
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar el material");
      }

      const responseData = await response.json();
      const newMaterial = responseData.data || responseData;

      setMessage({
        type: 'success',
        text: `Material tipo ${formData.type} cargado exitosamente`
      });

      setMaterials([newMaterial, ...materials]);

      setFormData({
        material_url: "",
        type: "PDF",
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

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'VIDEO') return <Video className="h-5 w-5" />;
    if (t === 'PDF') return <FileText className="h-5 w-5" />;
    if (t === 'DOCX' || t === 'DOC') return <FileType className="h-5 w-5" />;
    if (t === 'PPTX' || t === 'PPT') return <Presentation className="h-5 w-5" />;
    if (t === 'IMAGEN' || t === 'JPG' || t === 'PNG' || t === 'JPEG') return <Image className="h-5 w-5" />;
    if (t === 'XLSX' || t === 'XLS') return <FileText className="h-5 w-5" />;
    return <BookOpen className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'VIDEO') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (t === 'PDF') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (t === 'DOCX' || t === 'DOC') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (t === 'PPTX' || t === 'PPT') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (t === 'IMAGEN' || t === 'JPG' || t === 'PNG' || t === 'JPEG') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (t === 'XLSX' || t === 'XLS') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
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
                  Carga documentos, videos, imágenes y otros recursos educativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Material *</Label>
                    <Select 
                      value={formData.type}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOCX">DOCX (Word)</SelectItem>
                        <SelectItem value="PPTX">PPTX (PowerPoint)</SelectItem>
                        <SelectItem value="XLSX">XLSX (Excel)</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="IMAGEN">Imagen</SelectItem>
                        <SelectItem value="ENLACE">Enlace Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material_url">Archivo o Enlace del Material *</Label>

                    {formData.type.toUpperCase() === "ENLACE" ? (
                      <Input
                        id="material_url"
                        type="url"
                        placeholder="https://ejemplo.com/recurso"
                        value={formData.material_url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, material_url: e.target.value }))
                        }
                      />
                    ) : ["VIDEO", "IMAGEN"].includes(formData.type.toUpperCase()) ? (
                      <CloudinaryUploader
                        onUpload={(url) =>
                          setFormData((prev) => ({ ...prev, material_url: url }))
                        }
                        label={`Subir ${formData.type}`}
                        acceptType={
                          formData.type.toUpperCase() === "IMAGEN"
                            ? "image"
                            : formData.type.toUpperCase() === "VIDEO"
                            ? "video"
                            : "both"
                        }
                      />
                    ) : (
                      <DriveUploader
                        onUpload={(url) =>
                          setFormData((prev) => ({ ...prev, material_url: url }))
                        }
                        label={`Subir ${formData.type}`}
                      />
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formData.type.toUpperCase() === "ENLACE"
                        ? "Introduce una URL válida de una página o recurso en línea."
                        : "Los videos e imágenes se almacenan en Cloudinary. Los documentos se suben automáticamente a tu Google Drive."}
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
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate">
                              {getFileName(material.material_url)}
                            </h3>
                            <Badge className={getTypeColor(material.type)}>
                              {material.type}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <span>Creado: {formatDate(material.created_at)}</span>
                            <a 
                              href={material.material_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block"
                            >
                              Ver material →
                            </a>
                          </div>
                        </div>
                      </div>

                      {isTeacher && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMaterial(material.id)}
                            disabled={deletingId === material.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            {deletingId === material.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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