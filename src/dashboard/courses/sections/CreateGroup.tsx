import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { config } from "config";

interface CreateGroupProps {
  token: string | null;
  user: { id: number; name: string } | null;
}

export default function CreateGroup({ token, user }: CreateGroupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
  
  const [formData, setFormData] = useState({
    course_id: "",
    code: "",
    name: "",
    start_date: "",
    end_date: "",
  });

  // Cargar cursos disponibles
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await fetch(`${config.apiUrl}${config.endpoints.courses.getAll}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      course_id: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({
        type: 'error',
        text: 'Usuario no autenticado'
      });
      return;
    }

    setIsLoading(true);

    try {
      const groupData = {
        course_id: parseInt(formData.course_id),
        code: formData.code,
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        teacher_id: user.id
      };

      console.log("Enviando datos:", groupData);
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.groups.create}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(groupData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el grupo");
      }

      console.log("Grupo creado:", data);

      setMessage({
        type: 'success',
        text: `¡Grupo creado exitosamente! El grupo "${formData.name}" ha sido registrado.`
      });

      // Limpiar formulario
      setFormData({
        course_id: "",
        code: "",
        name: "",
        start_date: "",
        end_date: "",
      });

      // Redirigir o actualizar vista
      setTimeout(() => {
        window.location.hash = '';
      }, 1500);

    } catch (error) {
      console.error("Error al crear grupo:", error);
      
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el grupo"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="px-4 md:px-6 lg:px-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Crear Nuevo Grupo</h2>
            <p className="text-sm text-muted-foreground">
              Completa la información para crear un nuevo grupo académico
            </p>
          </CardHeader>
          <CardContent>
            {/* Mensaje de éxito o error */}
            {message && (
              <Alert 
                variant={message.type === 'error' ? 'destructive' : 'default'}
                className="mb-6"
              >
                {message.type === 'success' ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconAlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {message.type === 'success' ? '¡Éxito!' : 'Error'}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course_id">Curso *</Label>
                <Select 
                  value={formData.course_id}
                  onValueChange={handleSelectChange}
                  disabled={loadingCourses}
                >
                  <SelectTrigger id="course_id">
                    <SelectValue placeholder={
                      loadingCourses 
                        ? "Cargando cursos..." 
                        : "Selecciona un curso"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código del Grupo *</Label>
                <Input 
                  id="code" 
                  placeholder="Ej: GRP-2024-001" 
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo *</Label>
                <Input 
                  id="name" 
                  placeholder="Ej: Grupo A - Mañana" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input 
                    id="start_date" 
                    type="date" 
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin *</Label>
                  <Input 
                    id="end_date" 
                    type="date" 
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.location.hash = ''}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando..." : "Crear Grupo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}