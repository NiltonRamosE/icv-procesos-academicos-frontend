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
import { CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { config } from "config";

interface ClassFormProps {
  token: string | null;
  groupId: string;
  onClassAdded: () => void;
  isTeacher: boolean;
}

export default function ClassForm({ 
  token, 
  groupId, 
  onClassAdded,
  isTeacher 
}: ClassFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    class_name: "",
    description: "",
    class_date: "",
    start_time: "",
    end_time: "",
    class_status: "SCHEDULED",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class_status: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTeacher) {
      setMessage({
        type: 'error',
        text: 'Solo los docentes pueden crear clases'
      });
      return;
    }

    setIsLoading(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      // Formatear las fechas para Laravel
      const classDate = new Date(formData.class_date);
      const startTime = new Date(`${formData.class_date}T${formData.start_time}`);
      const endTime = new Date(`${formData.class_date}T${formData.end_time}`);

      const classData = {
        group_id: parseInt(groupId),
        class_name: formData.class_name,
        description: formData.description,
        class_date: classDate.toISOString().split('T')[0],
        start_time: startTime.toISOString().replace('T', ' ').substring(0, 19),
        end_time: endTime.toISOString().replace('T', ' ').substring(0, 19),
        class_status: formData.class_status,
      };

      const response = await fetch(`${config.apiUrl}${config.endpoints.classes.create}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la clase");
      }

      setMessage({
        type: 'success',
        text: `Clase "${formData.class_name}" creada exitosamente`
      });

      // Limpiar formulario
      setFormData({
        class_name: "",
        description: "",
        class_date: "",
        start_time: "",
        end_time: "",
        class_status: "SCHEDULED",
      });

      onClassAdded();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al crear la clase'
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
        <CardTitle>Crear Nueva Clase</CardTitle>
        <CardDescription>
          Agrega una nueva sesión de clase al grupo
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
          
          {/* Nombre de la Clase */}
          <div className="space-y-2">
            <Label htmlFor="class_name">Nombre de la Clase *</Label>
            <Input 
              id="class_name"
              name="class_name"
              placeholder="Ej: Introducción a HTML"
              value={formData.class_name}
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
              placeholder="Describe el contenido de la clase..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Fecha de la Clase */}
          <div className="space-y-2">
            <Label htmlFor="class_date">Fecha de la Clase *</Label>
            <Input 
              id="class_date"
              name="class_date"
              type="date"
              value={formData.class_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Hora de Inicio */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora de Inicio *</Label>
              <Input 
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Hora de Fin */}
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora de Fin *</Label>
              <Input 
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="class_status">Estado *</Label>
              <Select 
                value={formData.class_status}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="class_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={() => setFormData({
                class_name: "",
                description: "",
                class_date: "",
                start_time: "",
                end_time: "",
                class_status: "SCHEDULED",
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
              <BookOpen className="h-4 w-4" />
              {isLoading ? "Creando..." : "Crear Clase"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}