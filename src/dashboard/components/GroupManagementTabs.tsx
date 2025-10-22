import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconBellRinging, 
  IconFileText, 
  IconTrophy, 
  IconUsers, 
  IconVideo,
  IconPlus,
  IconCalendar,
  IconClock,
  IconLoader
} from "@tabler/icons-react";

import { config } from "config.ts"


interface GroupManagementTabsProps {
  user: any;
  token: string | null;
}

export default function GroupManagementTabs({ user, token }: GroupManagementTabsProps) {
  const [activeTab, setActiveTab] = useState("anuncios");
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any>({ teachers: [], students: [] });
  const [classes, setClasses] = useState<any[]>([]);

  // Determinar si es docente basado en el role del usuario
  const isTeacher = user?.role === "teacher" || user?.role === "docente";

  // Obtener ID del grupo desde la URL o usar uno por defecto
  const groupId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get("id") || "1"
    : "1";

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamadas reales a la API
      // Ejemplo de cómo hacer la llamada:
      // const response = await fetch(`${config.apiUrl}/api/groups/${groupId}`, {
      //   headers: { 
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      // const data = await response.json();
      // setGroupData(data);
      
      // DATOS DE EJEMPLO - Reemplazar con datos reales del backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga

      setGroupData({
        id: groupId,
        name: "Desarrollo Web Full Stack - Grupo A",
        courseName: "Desarrollo de Aplicaciones Web",
        teacherName: "Prof. Carlos Rodríguez",
        teacherPhoto: "/academico/images/9440461.webp",
        startDate: "2025-01-15",
        endDate: "2025-06-30"
      });

      setAnnouncements([
        { 
          id: 1, 
          title: "Bienvenida al curso", 
          content: "Bienvenidos a todos al curso de Desarrollo Web. Nos vemos el lunes para la primera clase virtual.",
          date: "2025-01-10", 
          author: "Prof. Carlos Rodríguez" 
        },
        { 
          id: 2, 
          title: "Recordatorio: Examen Parcial", 
          content: "El examen parcial será el próximo viernes. Repasen los temas vistos en las últimas semanas.",
          date: "2025-02-10", 
          author: "Prof. Carlos Rodríguez" 
        }
      ]);

      setEvaluations([
        { 
          id: 1, 
          title: "Examen Parcial 1", 
          type: "Exam", 
          startDate: "2025-02-15 09:00", 
          endDate: "2025-02-15 11:00", 
          duration: 120, 
          totalScore: 20 
        },
        { 
          id: 2, 
          title: "Trabajo Práctico 1 - Página Web Responsive", 
          type: "Assignment", 
          startDate: "2025-02-20 00:00", 
          endDate: "2025-02-27 23:59", 
          duration: null,
          totalScore: 15 
        },
        { 
          id: 3, 
          title: "Quiz - CSS Flexbox", 
          type: "Quiz", 
          startDate: "2025-03-01 10:00", 
          endDate: "2025-03-01 10:30", 
          duration: 30, 
          totalScore: 10 
        }
      ]);

      setGrades([
        { 
          id: 1, 
          studentName: "Ana García Mendoza", 
          evaluations: [
            { name: "Examen Parcial 1", grade: 18 },
            { name: "Trabajo Práctico 1", grade: 14 },
            { name: "Quiz CSS", grade: 9 }
          ],
          finalGrade: 16.5, 
          status: "InProgress" 
        },
        { 
          id: 2, 
          studentName: "Luis Pérez Santos", 
          evaluations: [
            { name: "Examen Parcial 1", grade: 15 },
            { name: "Trabajo Práctico 1", grade: 13 },
            { name: "Quiz CSS", grade: 8 }
          ],
          finalGrade: 14.2, 
          status: "InProgress" 
        },
        { 
          id: 3, 
          studentName: "María Torres Vega", 
          evaluations: [
            { name: "Examen Parcial 1", grade: 19 },
            { name: "Trabajo Práctico 1", grade: 15 },
            { name: "Quiz CSS", grade: 10 }
          ],
          finalGrade: 17.8, 
          status: "InProgress" 
        }
      ]);

      setParticipants({
        teachers: [
          { 
            id: 1, 
            name: "Prof. Carlos Rodríguez", 
            photo: "/academico/images/9440461.webp", 
            email: "carlos.rodriguez@incadev.edu.pe" 
          }
        ],
        students: [
          { id: 2, name: "Ana García Mendoza", photo: "/academico/images/9440461.webp", email: "ana.garcia@estudiante.edu.pe" },
          { id: 3, name: "Luis Pérez Santos", photo: "/academico/images/9440461.webp", email: "luis.perez@estudiante.edu.pe" },
          { id: 4, name: "María Torres Vega", photo: "/academico/images/9440461.webp", email: "maria.torres@estudiante.edu.pe" },
          { id: 5, name: "José Ramírez Cruz", photo: "/academico/images/9440461.webp", email: "jose.ramirez@estudiante.edu.pe" },
          { id: 6, name: "Carmen López Silva", photo: "/academico/images/9440461.webp", email: "carmen.lopez@estudiante.edu.pe" }
        ]
      });

      setClasses([
        { 
          id: 1, 
          name: "Introducción a React", 
          date: "2025-01-15", 
          startTime: "10:00", 
          endTime: "12:00", 
          meetingUrl: "https://meet.google.com/abc-defg-hij" 
        },
        { 
          id: 2, 
          name: "Componentes y Props", 
          date: "2025-01-17", 
          startTime: "10:00", 
          endTime: "12:00", 
          meetingUrl: "https://meet.google.com/xyz-uvwx-yz" 
        },
        { 
          id: 3, 
          name: "State y Lifecycle", 
          date: "2025-01-22", 
          startTime: "10:00", 
          endTime: "12:00", 
          meetingUrl: "https://meet.google.com/mno-pqrs-tuv" 
        }
      ]);

    } catch (error) {
      console.error("Error cargando datos del grupo:", error);
    } finally {
      setLoading(false);
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
      {/* Header del Grupo */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{groupData?.name}</h1>
        <p className="text-muted-foreground text-lg">{groupData?.courseName}</p>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={groupData?.teacherPhoto} />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
          <span className="text-sm">{groupData?.teacherName}</span>
        </div>
      </div>

      {/* Sistema de Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="anuncios" className="gap-2 flex-col sm:flex-row py-2">
            <IconBellRinging className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Anuncios</span>
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" className="gap-2 flex-col sm:flex-row py-2">
            <IconFileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Evaluaciones</span>
          </TabsTrigger>
          <TabsTrigger value="calificaciones" className="gap-2 flex-col sm:flex-row py-2">
            <IconTrophy className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Calificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="participantes" className="gap-2 flex-col sm:flex-row py-2">
            <IconUsers className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Participantes</span>
          </TabsTrigger>
          <TabsTrigger value="clases" className="gap-2 flex-col sm:flex-row py-2">
            <IconVideo className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Clases</span>
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA: Anuncios */}
        <TabsContent value="anuncios" className="space-y-4 mt-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-2xl font-semibold">Anuncios del Grupo</h2>
            {isTeacher && (
              <Button>
                <IconPlus className="h-4 w-4 mr-2" />
                Nuevo Anuncio
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    Por {announcement.author} - {new Date(announcement.date).toLocaleDateString('es-PE')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PESTAÑA: Evaluaciones */}
        <TabsContent value="evaluaciones" className="space-y-4 mt-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-2xl font-semibold">Evaluaciones</h2>
            {isTeacher && (
              <Button>
                <IconPlus className="h-4 w-4 mr-2" />
                Crear Evaluación
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle>{evaluation.title}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{evaluation.type}</Badge>
                      <Badge variant="secondary">{evaluation.totalScore} puntos</Badge>
                      {evaluation.duration && (
                        <Badge variant="secondary">
                          <IconClock className="h-3 w-3 mr-1" />
                          {evaluation.duration} min
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <IconCalendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Inicio</p>
                        <p>{new Date(evaluation.startDate).toLocaleString('es-PE')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <IconCalendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Fin</p>
                        <p>{new Date(evaluation.endDate).toLocaleString('es-PE')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PESTAÑA: Calificaciones */}
        <TabsContent value="calificaciones" className="space-y-4 mt-6">
          <h2 className="text-2xl font-semibold">Calificaciones</h2>

          {isTeacher ? (
            // Vista del docente
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Estudiante</th>
                        <th className="text-center p-3 font-semibold">Examen P1</th>
                        <th className="text-center p-3 font-semibold">Trabajo P1</th>
                        <th className="text-center p-3 font-semibold">Quiz CSS</th>
                        <th className="text-center p-3 font-semibold">Nota Final</th>
                        <th className="text-center p-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{student.studentName}</td>
                          <td className="p-3 text-center">{student.evaluations[0]?.grade || "-"}</td>
                          <td className="p-3 text-center">{student.evaluations[1]?.grade || "-"}</td>
                          <td className="p-3 text-center">{student.evaluations[2]?.grade || "-"}</td>
                          <td className="p-3 text-center font-semibold text-lg">{student.finalGrade}</td>
                          <td className="p-3 text-center">
                            <Badge variant={student.status === "Passed" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Vista del alumno
            <Card>
              <CardHeader>
                <CardTitle>Mis Calificaciones</CardTitle>
                <CardDescription>Resumen de tus evaluaciones y nota final</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {grades[0]?.evaluations.map((evaluation: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="font-medium">{evaluation.name}</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {evaluation.grade}
                    </Badge>
                  </div>
                ))}
                
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="text-lg font-semibold">Nota Final:</span>
                    <Badge variant="default" className="text-2xl px-4 py-2">
                      {grades[0]?.finalGrade}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado del Programa:</span>
                    <Badge variant="secondary">{grades[0]?.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PESTAÑA: Participantes */}
        <TabsContent value="participantes" className="space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">Participantes del Grupo</h2>

          {/* Docentes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Docentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.teachers.map((teacher: any) => (
                <Card key={teacher.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={teacher.photo} />
                        <AvatarFallback>
                          {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Alumnos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Alumnos ({participants.students.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.students.map((student: any) => (
                <Card key={student.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback>
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* PESTAÑA: Clases */}
        <TabsContent value="clases" className="space-y-4 mt-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-2xl font-semibold">Clases Programadas</h2>
            {isTeacher && (
              <Button>
                <IconPlus className="h-4 w-4 mr-2" />
                Programar Clase
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {classes.map((classItem) => (
              <Card key={classItem.id}>
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <IconVideo className="h-5 w-5" />
                        {classItem.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4" />
                        {new Date(classItem.date).toLocaleDateString('es-PE', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-2">
                        <IconClock className="h-4 w-4" />
                        {classItem.startTime} - {classItem.endTime}
                      </CardDescription>
                    </div>
                    <Button asChild variant="default">
                      <a href={classItem.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <IconVideo className="h-4 w-4 mr-2" />
                        Unirse a la Clase
                      </a>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}