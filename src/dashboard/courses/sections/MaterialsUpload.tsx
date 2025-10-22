import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Lock
} from "lucide-react";
import { config } from "config";

interface MaterialsUploadProps {
  token: string | null;
  groupId: string;
  onMaterialsAdded: () => void;
  isTeacher: boolean;
}

export default function MaterialsUpload({ 
  token, 
  groupId, 
  onMaterialsAdded,
  isTeacher 
}: MaterialsUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "document",
    file_url: "",
    visibility: "public",
  });

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

    setIsLoading(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const endpoint = `${config.apiUrl}${config.endpoints.educationalMaterials.create}`
        .replace(':groupId', groupId);

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

      setMessage({
        type: 'success',
        text: `Material "${formData.title}" cargado exitosamente`
      });

      // Limpiar formulario
      setFormData({
        title: "",
        description: "",
        type: "document",
        file_url: "",
        visibility: "public",
      });

      // Notificar que se agregó un material
      onMaterialsAdded();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al cargar el material'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTeacher) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar Nuevo Material</CardTitle>
        <CardDescription>
          Carga videos, documentos, textos y otros recursos educativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert 
            variant={message.type === 'error' ? 'destructive' : 'default'}
            className="mb-6"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Título */}
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

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea 
              id="description"
              name="description"
              placeholder="Describe el contenido del material..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tipo de Material */}
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

            {/* Visibilidad */}
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
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      Público (Todos ven)
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Privado (Solo profesor)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL del Archivo */}
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
              Proporciona la URL donde está alojado el archivo (YouTube, Google Drive, etc.)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={() => setFormData({
                title: "",
                description: "",
                type: "document",
                file_url: "",
                visibility: "public",
              })}
              disabled={isLoading}
            >
              Limpiar
            </Button>
            <Button 
              type="submit"
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
              {isLoading ? "Cargando..." : "Cargar Material"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}