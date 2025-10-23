import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  IconCheck, 
  IconAlertCircle, 
  IconUserCheck, 
  IconUserX,
  IconClock,
  IconCalendar,
  IconUsers,
  IconLoader,
  IconCheckbox
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TeacherAttendanceProps {
  token: string | null;
  user: any;
}

interface Group {
  id: number;
  name: string;
  course_name: string;
}

interface Class {
  id: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  photo: string;
  attendance_status?: 'present' | 'absent' | 'late' | null;
}

export default function TeacherAttendance({ token, user }: TeacherAttendanceProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, 'present' | 'absent' | 'late'>>({});

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadClasses(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      // Simulación - Reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGroups([
        { id: 1, name: "Grupo A - Mañana", course_name: "Desarrollo Web Full Stack" },
        { id: 2, name: "Grupo B - Tarde", course_name: "Python Avanzado" },
        { id: 3, name: "Grupo C - Noche", course_name: "React & TypeScript" }
      ]);
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async (groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setClasses([
        { id: 1, class_name: "Introducción a React", class_date: "2025-10-20", start_time: "10:00", end_time: "12:00" },
        { id: 2, class_name: "Componentes y Props", class_date: "2025-10-22", start_time: "10:00", end_time: "12:00" },
        { id: 3, class_name: "State y Hooks", class_date: "2025-10-24", start_time: "10:00", end_time: "12:00" }
      ]);
    } catch (error) {
      console.error("Error cargando clases:", error);
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const studentsList: Student[] = [
        { id: 1, name: "Ana García Mendoza", email: "ana.garcia@estudiante.edu.pe", photo: "/images/9440461.webp" },
        { id: 2, name: "Luis Pérez Santos", email: "luis.perez@estudiante.edu.pe", photo: "/images/9440461.webp" },
        { id: 3, name: "María Torres Vega", email: "maria.torres@estudiante.edu.pe", photo: "/images/9440461.webp" },
        { id: 4, name: "José Ramírez Cruz", email: "jose.ramirez@estudiante.edu.pe", photo: "/images/9440461.webp" },
        { id: 5, name: "Carmen López Silva", email: "carmen.lopez@estudiante.edu.pe", photo: "/images/9440461.webp" }
      ];
      
      setStudents(studentsList);
      
      // Inicializar todos como ausentes por defecto
      const initialAttendance: Record<number, 'present' | 'absent' | 'late'> = {};
      studentsList.forEach(student => {
        initialAttendance[student.id] = 'absent';
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
    }
  };

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<number, 'present' | 'absent' | 'late'> = {};
    students.forEach(student => {
      allPresent[student.id] = 'present';
    });
    setAttendanceData(allPresent);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) {
      setMessage({
        type: 'error',
        text: "Por favor, selecciona una clase primero"
      });
      return;
    }

    setSaving(true);
    try {
      // Aquí iría la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: "¡Asistencia registrada exitosamente!"
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      setMessage({
        type: 'error',
        text: "Error al guardar la asistencia. Por favor, intenta nuevamente."
      });
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendanceData).filter(s => s === 'present').length;
    const absent = Object.values(attendanceData).filter(s => s === 'absent').length;
    const late = Object.values(attendanceData).filter(s => s === 'late').length;
    return { present, absent, late };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconLoader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
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

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Registro de Asistencia</h2>
        <p className="text-muted-foreground">
          Marca la asistencia de los estudiantes para cada clase
        </p>
      </div>

      {/* Selectores de Grupo y Clase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name} - {group.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedClass} 
              onValueChange={setSelectedClass}
              disabled={!selectedGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elige una clase" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={String(classItem.id)}>
                    {classItem.class_name} - {new Date(classItem.class_date).toLocaleDateString('es-PE')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedClass && students.length > 0 && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{students.length}</p>
                  </div>
                  <IconUsers className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Presentes</p>
                    <p className="text-2xl font-bold text-green-500">{stats.present}</p>
                  </div>
                  <IconUserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ausentes</p>
                    <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
                  </div>
                  <IconUserX className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tardanzas</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.late}</p>
                  </div>
                  <IconClock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Estudiantes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Estudiantes</CardTitle>
                  <CardDescription>
                    Marca la asistencia de cada estudiante
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleMarkAllPresent}
                  size="sm"
                >
                  <IconCheckbox className="h-4 w-4 mr-2" />
                  Marcar Todos Presentes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={attendanceData[student.id] === 'present' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={attendanceData[student.id] === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        <IconUserCheck className="h-4 w-4 mr-1" />
                        Presente
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceData[student.id] === 'late' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={attendanceData[student.id] === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                      >
                        <IconClock className="h-4 w-4 mr-1" />
                        Tardanza
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceData[student.id] === 'absent' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={attendanceData[student.id] === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                      >
                        <IconUserX className="h-4 w-4 mr-1" />
                        Ausente
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? "Guardando..." : "Guardar Asistencia"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedGroup && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <IconUsers className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-semibold">Selecciona un Grupo</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Elige un grupo y una clase para comenzar a registrar la asistencia
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}