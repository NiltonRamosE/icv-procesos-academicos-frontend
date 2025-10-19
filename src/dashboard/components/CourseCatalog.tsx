import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconSearch, IconBook, IconClock, IconVideo, IconLoader } from "@tabler/icons-react";
import { config } from "config.ts"

interface Course {
  id: number;
  course_id: number;
  title: string;
  name: string | null;
  description: string | null;
  level: string;
  course_image: string | null;
  video_url: string | null;
  duration: string;
  sessions: number | null;
  selling_price: string;
  discount_price: string | null;
  prerequisites: string | null;
  certificate_name: boolean;
  certificate_issuer: string | null;
  bestseller: boolean;
  featured: boolean;
  highest_rated: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseCatalogProps {
  token: string | null;
}

export default function CourseCatalog({ token }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      const response = await fetch(`${config.apiUrl}${config.endpoints.courses.getAll}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      console.log("Cursos cargados:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cursos según búsqueda
  const filteredCourses = courses.filter(course =>
    course.status && (
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Función para obtener el color del badge según el nivel
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "basic":
      case "básico":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
      case "intermedio":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "advanced":
      case "avanzado":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  // Función para formatear el nivel
  const formatLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      "basic": "Básico",
      "intermediate": "Intermedio",
      "advanced": "Avanzado"
    };
    return levels[level.toLowerCase()] || level;
  };

  // Función para formatear el precio
  const formatPrice = (price: string) => {
    return `S/ ${parseFloat(price).toFixed(2)}`;
  };

  const handleCourseClick = (courseId: number) => {
    // Navegar a información de grupos con el ID del curso
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/informacion-grupos?courseId=${courseId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Explora Nuestros Cursos</h1>
          <p className="text-muted-foreground text-base md:text-lg mt-2">
            Encuentra el curso perfecto para impulsar tu carrera profesional
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative max-w-2xl">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título, nombre, nivel o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Estadísticas */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <IconBook className="h-4 w-4 mr-2" />
            {filteredCourses.length} cursos disponibles
          </Badge>
          {searchQuery && (
            <Badge variant="outline" className="text-sm px-4 py-2">
              Mostrando resultados para: "{searchQuery}"
            </Badge>
          )}
        </div>
      </div>

      {/* Grid de Cursos */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* Imagen del curso */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={course.course_image || "/images/9440461.webp"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getLevelColor(course.level)}>
                    {formatLevel(course.level)}
                  </Badge>
                </div>
                {course.bestseller && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-amber-500/90 text-white border-0">
                      Bestseller
                    </Badge>
                  </div>
                )}
                {course.featured && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-purple-500/90 text-white border-0">
                      Destacado
                    </Badge>
                  </div>
                )}
                {course.highest_rated && (
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-blue-500/90 text-white border-0">
                      Mejor Valorado
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="space-y-2">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                {course.name && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {course.name}
                  </p>
                )}
                <CardDescription className="line-clamp-3 text-sm">
                  {course.description || "Sin descripción disponible"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-1">
                {/* Información adicional */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <IconClock className="h-4 w-4" />
                      <span>{parseFloat(course.duration).toFixed(0)}h</span>
                    </div>
                  )}
                  {course.sessions && (
                    <div className="flex items-center gap-1">
                      <IconBook className="h-4 w-4" />
                      <span>{course.sessions} sesiones</span>
                    </div>
                  )}
                  {course.video_url && (
                    <div className="flex items-center gap-1">
                      <IconVideo className="h-4 w-4" />
                      <span>Video</span>
                    </div>
                  )}
                </div>

                {/* Pre-requisitos */}
                {course.prerequisites && (
                  <div className="text-xs">
                    <span className="font-medium">Pre-requisitos:</span>
                    <span className="text-muted-foreground ml-1">
                      {course.prerequisites}
                    </span>
                  </div>
                )}

                {/* Certificación */}
                {course.certificate_issuer && (
                  <div className="text-xs">
                    <span className="font-medium">Certificado por:</span>
                    <span className="text-muted-foreground ml-1">
                      {course.certificate_issuer}
                    </span>
                  </div>
                )}

                {/* Precio */}
                <div className="pt-2">
                  {course.discount_price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(course.discount_price)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(course.selling_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">
                      {formatPrice(course.selling_price)}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full group-hover:bg-primary/90" size="lg">
                  Ver Grupos Disponibles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Mensaje cuando no hay resultados
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <IconSearch className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold">No se encontraron cursos</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No pudimos encontrar ningún curso que coincida con "{searchQuery}". 
              Intenta con otros términos de búsqueda.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Limpiar búsqueda
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}