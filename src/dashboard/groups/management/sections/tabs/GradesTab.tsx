// components/grades-tab.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconLoader,
  IconUser,
  IconEdit,
  IconChartBar,
  IconSchool
} from "@tabler/icons-react";
import { config } from "config";
import StudentGradesModal from "@/dashboard/groups/management/components/student-grades-modal";

interface GradesTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
  userId: number;
}

interface Grade {
  student_id: number;
  student_name: string;
  obtained_grade: string;
  feedback: string | null;
  record_date: string;
}

interface Evaluation {
  id: number;
  title: string;
  description: string | null;
  evaluation_type: string;
  due_date: string;
  weight: string;
  teacher_creator_id: number;
  grades: Grade[];
}

interface Student {
  id: number;
  name: string;
  evaluations: {
    evaluation_id: number;
    evaluation_title: string;
    evaluation_type: string;
    weight: string;
    obtained_grade: string | null;
    feedback: string | null;
    record_date: string | null;
  }[];
  average_grade?: number;
}

export default function GradesTab({ groupId, token, isTeacher, userId }: GradesTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadGrades();
  }, [groupId]);

  const loadGrades = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.grades.getByGroup}`.replace(":groupId", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar calificaciones: ${response.status}`);
      }

      const data = await response.json();
      setEvaluations(data.evaluations || []);

      // Transformar los datos para agrupar por estudiante
      const studentsData = transformDataToStudents(data.evaluations || []);
      setStudents(studentsData);

    } catch (err) {
      console.error("Error cargando calificaciones:", err);
      setError(err instanceof Error ? err.message : "Error al cargar calificaciones");
    } finally {
      setLoading(false);
    }
  };

  const transformDataToStudents = (evaluationsData: Evaluation[]): Student[] => {
    const studentsMap = new Map<number, Student>();

    evaluationsData.forEach(evaluation => {
      evaluation.grades.forEach(grade => {
        if (!studentsMap.has(grade.student_id)) {
          studentsMap.set(grade.student_id, {
            id: grade.student_id,
            name: grade.student_name,
            evaluations: []
          });
        }

        const student = studentsMap.get(grade.student_id)!;
        student.evaluations.push({
          evaluation_id: evaluation.id,
          evaluation_title: evaluation.title,
          evaluation_type: evaluation.evaluation_type,
          weight: evaluation.weight,
          obtained_grade: grade.obtained_grade,
          feedback: grade.feedback,
          record_date: grade.record_date
        });
      });
    });

    // Calcular promedio para cada estudiante
    const studentsArray = Array.from(studentsMap.values());
    studentsArray.forEach(student => {
      const gradesWithValues = student.evaluations
        .filter(evalItem => evalItem.obtained_grade !== null)
        .map(evalItem => parseFloat(evalItem.obtained_grade!));

      if (gradesWithValues.length > 0) {
        const sum = gradesWithValues.reduce((acc, grade) => acc + grade, 0);
        student.average_grade = parseFloat((sum / gradesWithValues.length).toFixed(2));
      }
    });

    return studentsArray;
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleGradesUpdated = () => {
    // Recargar los datos después de actualizar calificaciones
    loadGrades();
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "bg-gray-100 text-gray-800";
    if (grade >= 16) return "bg-green-100 text-green-800";
    if (grade >= 13) return "bg-blue-100 text-blue-800";
    if (grade >= 11) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getEvaluationTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      'Exam': { label: 'Examen', variant: 'default' },
      'Project': { label: 'Proyecto', variant: 'secondary' },
      'Quiz': { label: 'Quiz', variant: 'outline' },
      'Assignment': { label: 'Tarea', variant: 'outline' }
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getCompletedEvaluationsCount = (student: Student) => {
    return student.evaluations.filter(evalItem => evalItem.obtained_grade !== null).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando calificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Button onClick={loadGrades}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Calificaciones del Grupo</h2>
            <p className="text-muted-foreground mt-1">
              {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'} en total
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <IconSchool className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-muted-foreground">No hay estudiantes</h3>
                  <p className="text-muted-foreground mt-2">
                    Aún no hay estudiantes registrados en este grupo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card 
                key={student.id} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleStudentClick(student)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconUser className="h-5 w-5 text-primary" />
                        {student.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <IconChartBar className="h-4 w-4" />
                        {getCompletedEvaluationsCount(student)}/{student.evaluations.length} evaluaciones
                      </CardDescription>
                    </div>
                    {isTeacher && (
                      <IconEdit className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Promedio del estudiante */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Promedio:</span>
                    {student.average_grade !== undefined ? (
                      <Badge className={`${getGradeColor(student.average_grade)} font-semibold`}>
                        {student.average_grade}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sin calificaciones
                      </Badge>
                    )}
                  </div>

                  {/* Resumen de evaluaciones */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Evaluaciones:</h4>
                    <div className="space-y-1">
                      {student.evaluations.slice(0, 3).map((evaluation) => (
                        <div key={evaluation.evaluation_id} className="flex justify-between items-center text-xs">
                          <span className="truncate flex-1 mr-2">{evaluation.evaluation_title}</span>
                          {evaluation.obtained_grade ? (
                            <Badge 
                              variant="outline" 
                              className={`${getGradeColor(parseFloat(evaluation.obtained_grade))} text-xs`}
                            >
                              {evaluation.obtained_grade}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-xs">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      ))}
                      {student.evaluations.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{student.evaluations.length - 3} más...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado general */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-xs">
                      <span>Estado:</span>
                      {getCompletedEvaluationsCount(student) === student.evaluations.length ? (
                        <Badge variant="default" className="text-xs">
                          Completo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          En progreso
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ver/editar calificaciones del estudiante */}
      {selectedStudent && (
        <StudentGradesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGradesUpdated={handleGradesUpdated}
          student={selectedStudent}
          evaluations={evaluations}
          token={token}
          isTeacher={isTeacher}
        />
      )}
    </>
  );
}