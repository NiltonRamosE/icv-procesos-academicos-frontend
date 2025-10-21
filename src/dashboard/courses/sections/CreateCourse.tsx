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
import { IconCheck, IconAlertCircle, IconX } from "@tabler/icons-react";
import { config } from "config";

interface CreateCourseProps {
  token: string | null;
}

export default function CreateCourse({ token }: CreateCourseProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const tokenWithoutQuotes = token?.replace(/^"|"$/g, "");
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    name: "",
    description: "",
    level: "basic",
    course_image: "",
    video_url: "",
    duration: "",
    sessions: "",
    selling_price: "",
    discount_price: "",
    prerequisites: [] as string[],
    certificate_issuer: "",
  });

  // Cargar cursos disponibles para prerrequisitos
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.courses.getAll}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenWithoutQuotes}`,
              "Content-Type": "application/json",
            },
          }
        );

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrerequisiteAdd = (courseId: string) => {
    console.log("courseid entrante: ", courseId);

    const normalizedNewId = courseId.toString();

    const alreadyExists = formData.prerequisites.some(
      (existingId) => existingId.toString() === normalizedNewId
    );

    if (!alreadyExists && courseId !== "none") {
      console.log("prerrequisitos actuales: ", formData.prerequisites);

      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, normalizedNewId],
      }));
    } else {
      console.log("El curso ya existe en prerrequisitos o es 'none'");
    }
  };

  const handlePrerequisiteRemove = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((id) => id !== courseId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Preparar datos para enviar (solo campos con valores)
      const courseData: any = {
        course_id: parseInt(formData.course_id),
        title: formData.title,
        level: formData.level,
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.name) courseData.name = formData.name;
      if (formData.description) courseData.description = formData.description;
      if (formData.course_image)
        courseData.course_image = formData.course_image;
      if (formData.video_url) courseData.video_url = formData.video_url;
      if (formData.duration)
        courseData.duration = parseFloat(formData.duration);
      if (formData.sessions) courseData.sessions = parseInt(formData.sessions);
      if (formData.selling_price)
        courseData.selling_price = parseFloat(formData.selling_price);
      if (formData.discount_price)
        courseData.discount_price = parseFloat(formData.discount_price);
      if (formData.prerequisites.length > 0) {
        courseData.prerequisites = formData.prerequisites.join(",");
      }
      if (formData.certificate_issuer)
        courseData.certificate_issuer = formData.certificate_issuer;

      console.log("Enviando datos:", courseData);

      const response = await fetch(
        `${config.apiUrl}${config.endpoints.courses.create}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(courseData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el curso");
      }

      console.log("Curso creado:", data);

      setMessage({
        type: "success",
        text: `¡Curso creado exitosamente! El curso "${formData.title}" ha sido registrado.`,
      });

      // Limpiar formulario
      setFormData({
        course_id: "",
        title: "",
        name: "",
        description: "",
        level: "basic",
        course_image: "",
        video_url: "",
        duration: "",
        sessions: "",
        selling_price: "",
        discount_price: "",
        prerequisites: [],
        certificate_issuer: "",
      });

      setTimeout(() => {
        window.location.href = "/academico/dashboard/catalogo";
      }, 1500);
    } catch (error) {
      console.error("Error al crear curso:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al crear el curso",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(
      (c) => c.id === courseId || c.id?.toString() === courseId
    );
    console.log("dato del curso: ", course);
    return course?.title;
  };

  return (
    <section className="px-4 md:px-6 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Crear Nuevo Curso</h2>
            <p className="text-sm text-muted-foreground">
              Define la información del curso que será utilizado para crear
              grupos
            </p>
          </CardHeader>
          <CardContent>
            {/* Mensaje de éxito o error */}
            {message && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className="mb-6"
              >
                {message.type === "success" ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconAlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {message.type === "success" ? "¡Éxito!" : "Error"}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course_id">ID del Curso *</Label>
                    <Input
                      id="course_id"
                      type="number"
                      placeholder="1001"
                      value={formData.course_id}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Desarrollo Web Fullstack"
                      maxLength={255}
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre (opcional)</Label>
                  <Input
                    id="name"
                    placeholder="DWF 2024"
                    maxLength={200}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe el contenido, objetivos y metodología del curso..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nivel *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      handleSelectChange("level", value)
                    }
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multimedia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Multimedia</h3>

                <div className="space-y-2">
                  <Label htmlFor="course_image">URL de Imagen del Curso</Label>
                  <Input
                    id="course_image"
                    type="url"
                    placeholder="https://ejemplo.com/curso.jpg"
                    maxLength={255}
                    value={formData.course_image}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">URL de Video Promocional</Label>
                  <Input
                    id="video_url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    maxLength={255}
                    value={formData.video_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Detalles del Curso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalles del Curso</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      step="1"
                      placeholder="120"
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessions">Número de Sesiones</Label>
                    <Input
                      id="sessions"
                      type="number"
                      placeholder="40"
                      min="0"
                      value={formData.sessions}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Precios</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selling_price">Precio de Venta</Label>
                    <Input
                      id="selling_price"
                      type="number"
                      step="1"
                      placeholder="299.99"
                      min="0"
                      value={formData.selling_price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_price">Precio con Descuento</Label>
                    <Input
                      id="discount_price"
                      type="number"
                      step="0.5"
                      placeholder="199.99"
                      min="0"
                      value={formData.discount_price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Prerrequisitos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prerrequisitos</h3>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Cursos Prerrequisitos</Label>
                  <Select
                    onValueChange={handlePrerequisiteAdd}
                    disabled={loadingCourses}
                  >
                    <SelectTrigger id="prerequisites">
                      <SelectValue
                        placeholder={
                          loadingCourses
                            ? "Cargando cursos..."
                            : "Selecciona cursos prerrequisitos (opcional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin prerrequisitos</SelectItem>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.id}
                          value={course.id}
                          disabled={formData.prerequisites.includes(
                            course.id
                          )}
                        >
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Los prerrequisitos ayudan a los estudiantes a saber qué
                    conocimientos previos necesitan
                  </p>

                  {/* Mostrar cursos seleccionados */}
                  {formData.prerequisites.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.prerequisites.map((courseId) => {
                        const courseName = getCourseName(courseId);
                        return (
                          <div
                            key={courseId}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            <span>{courseName}</span>
                            <button
                              type="button"
                              onClick={() => handlePrerequisiteRemove(courseId)}
                              className="hover:text-blue-900 transition-colors"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Certificación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Certificación</h3>

                <div className="space-y-2">
                  <Label htmlFor="certificate_issuer">
                    Emisor del Certificado
                  </Label>
                  <Input
                    id="certificate_issuer"
                    placeholder="Universidad Incadev"
                    maxLength={255}
                    value={formData.certificate_issuer}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => (window.location.hash = "")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear Curso"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
