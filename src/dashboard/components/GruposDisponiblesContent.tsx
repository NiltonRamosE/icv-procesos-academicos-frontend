import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconArrowLeft, IconClock, IconCalendar, IconUsers, IconLoader, IconSun, IconMoon, IconSunset } from "@tabler/icons-react";

interface Course {
  id: number;
  name: string;
  description: string;
  image: string;
  level: string;
  duration: string;
}

interface Group {
  id: number;
  groupName: string;
  schedule: string;
  shift: "morning" | "afternoon" | "night";
  startDate: string;
  endDate: string;
  teacher: {
    name: string;
    photo: string;
  };
  availableSpots: number;
  totalSpots: number;
  status: "available" | "full" | "upcoming";
}

interface GruposDisponiblesContentProps {
  token: string | null;
}

export default function GruposDisponiblesContent({ token }: GruposDisponiblesContentProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('courseId');
    const courseParam = params.get('course');
    
    setCourseId(id);
    if (id) {
      if (courseParam) {
        try {
          const courseData = JSON.parse(decodeURIComponent(courseParam));
          setCourse(courseData);
          loadGroups(id);
        } catch (error) {
          console.error("Error parsing course data:", error);
        }
      } else {
        loadCourseAndGroups(id);
      }
    }
  }
}, []);

// En GruposDisponiblesContent.tsx - Reemplazar loadGroups:
const loadGroups = async (id: string) => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    const groupsData: Group[] = [
      {
        id: 101,
        groupName: "Grupo A - Mañana",
        schedule: "Lunes a Viernes, 8:00 AM - 12:00 PM",
        shift: "morning",
        startDate: "2025-11-01",
        endDate: "2026-04-30",
        teacher: {
          name: "Prof. Carlos Rodríguez",
          photo: "/images/9440461.webp"
        },
        availableSpots: 5,
        totalSpots: 25,
        status: "available"
      },
      {
        id: 102,
        groupName: "Grupo B - Tarde",
        schedule: "Lunes a Viernes, 2:00 PM - 6:00 PM",
        shift: "afternoon",
        startDate: "2025-11-01",
        endDate: "2026-04-30",
        teacher: {
          name: "Prof. María González",
          photo: "/images/9440461.webp"
        },
        availableSpots: 12,
        totalSpots: 25,
        status: "available"
      },
      {
        id: 103,
        groupName: "Grupo C - Noche",
        schedule: "Lunes a Viernes, 7:00 PM - 11:00 PM",
        shift: "night",
        startDate: "2025-11-01",
        endDate: "2026-04-30",
        teacher: {
          name: "Prof. Luis Martínez",
          photo: "/images/9440461.webp"
        },
        availableSpots: 0,
        totalSpots: 25,
        status: "full"
      },
      {
        id: 104,
        groupName: "Grupo D - Mañana",
        schedule: "Lunes a Viernes, 9:00 AM - 1:00 PM",
        shift: "morning",
        startDate: "2025-12-01",
        endDate: "2026-05-31",
        teacher: {
          name: "Prof. Ana Silva",
          photo: "/images/9440461.webp"
        },
        availableSpots: 20,
        totalSpots: 25,
        status: "upcoming"
      }
    ];

    setGroups(groupsData);
  } catch (error) {
    console.error("Error cargando grupos:", error);
  } finally {
    setLoading(false);
  }
};
  const loadCourseAndGroups = async (id: string) => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await fetch(`${config.apiUrl}/api/courses/${id}/groups`, {
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 500));

      const courseData: Course = {
        id: parseInt(id),
        name: "Desarrollo Web Full Stack",
        description: "Aprende a crear aplicaciones web completas desde cero, dominando tanto frontend como backend con las tecnologías más demandadas del mercado.",
        image: "/images/9440461.webp",
        level: "Intermedio",
        duration: "6 meses"
      };

      const groupsData: Group[] = [
        {
          id: 101,
          groupName: "Grupo A - Mañana",
          schedule: "Lunes a Viernes, 8:00 AM - 12:00 PM",
          shift: "morning",
          startDate: "2025-11-01",
          endDate: "2026-04-30",
          teacher: {
            name: "Prof. Carlos Rodríguez",
            photo: "/images/9440461.webp"
          },
          availableSpots: 5,
          totalSpots: 25,
          status: "available"
        },
        {
          id: 102,
          groupName: "Grupo B - Tarde",
          schedule: "Lunes a Viernes, 2:00 PM - 6:00 PM",
          shift: "afternoon",
          startDate: "2025-11-01",
          endDate: "2026-04-30",
          teacher: {
            name: "Prof. María González",
            photo: "/images/9440461.webp"
          },
          availableSpots: 12,
          totalSpots: 25,
          status: "available"
        },
        {
          id: 103,
          groupName: "Grupo C - Noche",
          schedule: "Lunes a Viernes, 7:00 PM - 11:00 PM",
          shift: "night",
          startDate: "2025-11-01",
          endDate: "2026-04-30",
          teacher: {
            name: "Prof. Luis Martínez",
            photo: "/images/9440461.webp"
          },
          availableSpots: 0,
          totalSpots: 25,
          status: "full"
        },
        {
          id: 104,
          groupName: "Grupo D - Mañana",
          schedule: "Lunes a Viernes, 9:00 AM - 1:00 PM",
          shift: "morning",
          startDate: "2025-12-01",
          endDate: "2026-05-31",
          teacher: {
            name: "Prof. Ana Silva",
            photo: "/images/9440461.webp"
          },
          availableSpots: 20,
          totalSpots: 25,
          status: "upcoming"
        }
      ];

      setCourse(courseData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCatalog = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard/catalogo';
    }
  };

  const handleGroupClick = (groupId: number) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/informacion-grupos?groupId=${groupId}`;
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case "morning":
        return <IconSun className="h-5 w-5" />;
      case "afternoon":
        return <IconSunset className="h-5 w-5" />;
      case "night":
        return <IconMoon className="h-5 w-5" />;
      default:
        return <IconClock className="h-5 w-5" />;
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "morning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "afternoon":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "night":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Disponible</Badge>;
      case "full":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">Completo</Badge>;
      case "upcoming":
        return <Badge variant="outline">Próximamente</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No se pudo cargar el curso</p>
          <Button onClick={handleBackToCatalog}>Volver al Catálogo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <Button 
        variant="ghost" 
        onClick={handleBackToCatalog}
        className="gap-2"
      >
        <IconArrowLeft className="h-4 w-4" />
        Volver al Catálogo
      </Button>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0">
            <img 
              src={course.image} 
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <CardHeader className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{course.name}</CardTitle>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  {course.description}
                </CardDescription>
              </div>
            </CardHeader>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Grupos Disponibles</h2>
        <p className="text-muted-foreground">
          Selecciona el grupo que mejor se ajuste a tu horario
        </p>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card 
              key={group.id}
              className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                group.status === 'full' ? 'opacity-60' : ''
              }`}
              onClick={() => group.status !== 'full' && handleGroupClick(group.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {group.groupName}
                  </CardTitle>
                  {getStatusBadge(group.status)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getShiftColor(group.shift)}>
                    {getShiftIcon(group.shift)}
                    <span className="ml-2 capitalize">
                      {group.shift === "morning" ? "Mañana" : group.shift === "afternoon" ? "Tarde" : "Noche"}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <IconClock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{group.schedule}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Inicio: {new Date(group.startDate).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Fin: {new Date(group.endDate).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.teacher.photo} />
                    <AvatarFallback>
                      {group.teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{group.teacher.name}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <IconUsers className="h-4 w-4" />
                      Cupos disponibles
                    </span>
                    <span className="font-semibold">
                      {group.availableSpots}/{group.totalSpots}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        group.status === 'full' ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ 
                        width: `${((group.totalSpots - group.availableSpots) / group.totalSpots) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={group.status === 'full'}
                  variant={group.status === 'full' ? 'secondary' : 'default'}
                >
                  {group.status === 'full' ? 'Grupo Completo' : 'Ver Detalles del Grupo'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold">No hay grupos disponibles</h3>
            <p className="text-muted-foreground">
              Actualmente no hay grupos programados para este curso.
            </p>
            <Button onClick={handleBackToCatalog}>
              Explorar Otros Cursos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// ARCHIVO 3: MODIFICACIÓN en /src/dashboard/components/CourseCatalog.tsx
// Cambiar la línea 151 (función handleCourseClick)
// ============================================
/*
  const handleCourseClick = (courseId: number) => {
    // CAMBIAR ESTA LÍNEA:
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/grupos-disponibles?courseId=${courseId}`;
    }
  };
*/

// ============================================
// ARCHIVO 4: MODIFICACIÓN en /src/dashboard/groups/information/InformationGroup.tsx
// Cambiar líneas 42-50 (dentro de useEffect, función fetchGroupData)
// ============================================
/*
  useEffect(() => {
    setMounted(true);
    
    const fetchGroupData = async () => {
      // CAMBIAR ESTAS LÍNEAS:
      const params = new URLSearchParams(window.location.search);
      const groupId = params.get('groupId') || '1';
      
      // const response = await fetch(`/api/groups/${groupId}`);
      // const data = await response.json();
      
      // ... resto del código se mantiene igual
    };
    
    fetchGroupData();
  }, []);
*/