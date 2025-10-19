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
import { IconSearch, IconBook, IconClock, IconUsers, IconLoader } from "@tabler/icons-react";
import { config } from "config.ts"

interface Course {
  id: number;
  name: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  students: number;
  status: boolean;
  prerequisites: string;
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
      // TODO: Reemplazar con llamada real a la API
      // Ejemplo de cómo hacer la llamada:
      // const response = await fetch(`${config.apiUrl}/api/courses`, {
      //   headers: { 
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      // const data = await response.json();
      // setCourses(data);

      // DATOS DE EJEMPLO - Reemplazar con datos reales del backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga

      setCourses([
        {
          id: 1,
          name: "Desarrollo Web Full Stack",
          description: "Aprende a crear aplicaciones web completas desde cero, dominando tanto frontend como backend con las tecnologías más demandadas del mercado.",
          image: "/images/9440461.webp",
          level: "Intermedio",
          duration: "6 meses",
          students: 250,
          status: true,
          prerequisites: "HTML, CSS básico"
        },
        {
          id: 2,
          name: "Python para Data Science",
          description: "Domina Python y las principales librerías para análisis de datos, machine learning y visualización de información.",
          image: "/images/9440461.webp",
          level: "Principiante",
          duration: "4 meses",
          students: 180,
          status: true,
          prerequisites: "Conocimientos básicos de programación"
        },
        {
          id: 3,
          name: "React Native para Aplicaciones Móviles",
          description: "Desarrolla aplicaciones móviles nativas para iOS y Android utilizando React Native y JavaScript.",
          image: "/images/9440461.webp",
          level: "Avanzado",
          duration: "5 meses",
          students: 120,
          status: true,
          prerequisites: "JavaScript, React"
        },
        {
          id: 4,
          name: "Diseño UX/UI Profesional",
          description: "Aprende los principios del diseño centrado en el usuario y crea interfaces atractivas y funcionales.",
          image: "/images/9440461.webp",
          level: "Principiante",
          duration: "3 meses",
          students: 200,
          status: true,
          prerequisites: "Ninguno"
        },
        {
          id: 5,
          name: "DevOps y Cloud Computing",
          description: "Domina las prácticas de DevOps y aprende a desplegar aplicaciones en la nube con AWS, Docker y Kubernetes.",
          image: "/images/9440461.webp",
          level: "Avanzado",
          duration: "6 meses",
          students: 95,
          status: true,
          prerequisites: "Linux, Redes, Programación"
        },
        {
          id: 6,
          name: "Ciberseguridad Ética",
          description: "Aprende técnicas de hacking ético y protección de sistemas para convertirte en un experto en seguridad informática.",
          image: "/images/9440461.webp",
          level: "Intermedio",
          duration: "5 meses",
          students: 150,
          status: true,
          prerequisites: "Redes, Sistemas operativos"
        },
        {
          id: 7,
          name: "Inteligencia Artificial y Machine Learning",
          description: "Explora el mundo de la IA y aprende a crear modelos de machine learning con Python y TensorFlow.",
          image: "/images/9440461.webp",
          level: "Avanzado",
          duration: "7 meses",
          students: 175,
          status: true,
          prerequisites: "Python, Matemáticas, Estadística"
        },
        {
          id: 8,
          name: "Marketing Digital y Redes Sociales",
          description: "Domina las estrategias de marketing digital y aprende a crear campañas efectivas en redes sociales.",
          image: "/images/9440461.webp",
          level: "Principiante",
          duration: "3 meses",
          students: 220,
          status: true,
          prerequisites: "Ninguno"
        }
      ]);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cursos según búsqueda
  const filteredCourses = courses.filter(course =>
    course.status && (
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Función para obtener el color del badge según el nivel
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermedio":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Avanzado":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
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
            placeholder="Buscar por nombre de curso, nivel o descripción..."
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
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* Imagen del curso */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </div>

              <CardHeader className="space-y-2">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {course.name}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Información adicional */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconClock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconUsers className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
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