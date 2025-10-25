// components/teacher-attendance.tsx
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
import { config } from "config";
import { en } from "zod/v4/locales";

interface TeacherAttendanceProps {
  token: string | null;
  user: any;
}

interface Group {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
  class_status: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  group_participant_id: number;
}

interface AttendanceData {
  group_participant_id: number;
  class_id: number;
  attended: boolean;
  observations?: string;
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
  const [attendanceData, setAttendanceData] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadTeacherGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadClasses(selectedGroup);
      setSelectedClass("");
      setStudents([]);
      setAttendanceData({});
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedGroup, selectedClass);
    }
  }, [selectedClass]);

  const loadTeacherGroups = async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointTeacherGroups = config.endpoints.groups.getGroupsByTeacher.replace(':userId', user.id);
      const response = await fetch(`${config.apiUrl}${endpointTeacherGroups}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar grupos del docente");
      }

      const data = await response.json();
      
      const groupsList: Group[] = data.map((groupItem: any) => ({
        id: groupItem.group.id,
        name: groupItem.group.name,
        code: groupItem.group.code
      })) || [];

      setGroups(groupsList);
    } catch (error) {
      console.error("Error cargando grupos:", error);
      setMessage({
        type: 'error',
        text: "Error al cargar los grupos. Por favor, intenta nuevamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async (groupId: string) => {
    if (!token) return;

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointClasses = config.endpoints.classes.getByGroup.replace(':groupId', groupId);
      const response = await fetch(
        `${config.apiUrl}${endpointClasses}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar clases");
      }

      const data = await response.json();
      
      const classesList: Class[] = data.classes?.map((classItem: any) => ({
        id: classItem.id,
        class_name: classItem.class_name,
        class_date: classItem.class_date,
        start_time: classItem.start_time,
        end_time: classItem.end_time,
        class_status: classItem.class_status
      })) || [];

      setClasses(classesList);
    } catch (error) {
      console.error("Error cargando clases:", error);
      setMessage({
        type: 'error',
        text: "Error al cargar las clases. Por favor, intenta nuevamente."
      });
    }
  };

  const loadStudents = async (groupId: string, classId: string) => {
    if (!token) return;

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointStudents = config.endpoints.groups.getStudentsByGroup.replace(':groupId', groupId);
      const response = await fetch(
        `${config.apiUrl}${endpointStudents}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }

      const data = await response.json();
      
      const studentsList: Student[] = data.map((studentItem: any) => ({
        id: studentItem.user.id,
        name: studentItem.user.full_name,
        email: studentItem.user.email,
        photo: studentItem.user.profile_photo,
        group_participant_id: studentItem.id
      })) || [];

      setStudents(studentsList);
      
      // Cargar asistencias existentes para esta clase
      loadExistingAttendances(classId, studentsList);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
      setMessage({
        type: 'error',
        text: "Error al cargar los estudiantes. Por favor, intenta nuevamente."
      });
    }
  };

  const loadExistingAttendances = async (classId: string, studentsList: Student[]) => {
    if (!token) return;

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointExistingAttendances = config.endpoints.attendance.getAttendancesByClass.replace(':classId', classId);
      const response = await fetch(
        `${config.apiUrl}${endpointExistingAttendances}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      const initialAttendance: Record<number, boolean> = {};
      
      if (response.ok) {
        const data = await response.json();
        
        // Mapear asistencias existentes
        data.forEach((attendance: any) => {
          initialAttendance[attendance.group_participant_id] = attendance.attended;
        });
      }
      
      // Inicializar los que no tienen asistencia como ausentes (false)
      studentsList.forEach(student => {
        if (initialAttendance[student.group_participant_id] === undefined) {
          initialAttendance[student.group_participant_id] = false;
        }
      });
      
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error("Error cargando asistencias existentes:", error);
    }
  };

  const handleAttendanceChange = (groupParticipantId: number, attended: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [groupParticipantId]: attended
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<number, boolean> = {};
    students.forEach(student => {
      allPresent[student.group_participant_id] = true;
    });
    setAttendanceData(allPresent);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || !token) {
      setMessage({
        type: 'error',
        text: "Por favor, selecciona una clase primero"
      });
      return;
    }

    setSaving(true);
    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const attendanceRecords: AttendanceData[] = [];

      // Preparar datos para enviar
      students.forEach(student => {
        attendanceRecords.push({
          group_participant_id: student.group_participant_id,
          class_id: parseInt(selectedClass),
          attended: attendanceData[student.group_participant_id] || false,
          observations: ""
        });
      });

      // Enviar cada registro de asistencia
      const promises = attendanceRecords.map(record =>
        fetch(`${config.apiUrl}${config.endpoints.attendance.create}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(record)
        })
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(response => response.ok);

      if (allSuccessful) {
        setMessage({
          type: 'success',
          text: "¡Asistencia registrada exitosamente!"
        });
      } else {
        throw new Error("Algunas asistencias no se pudieron guardar");
      }

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
    const present = Object.values(attendanceData).filter(attended => attended).length;
    const absent = Object.values(attendanceData).filter(attended => !attended).length;
    return { present, absent };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
                    {group.name} ({group.code})
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
                    <div className="flex flex-col">
                      <span className="font-medium">{classItem.class_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(classItem.class_date)} • {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </span>
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <AvatarImage src={student.photo || "/academico/images/9439727.webp"} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                        variant={attendanceData[student.group_participant_id] ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.group_participant_id, true)}
                        className={attendanceData[student.group_participant_id] ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        <IconUserCheck className="h-4 w-4 mr-1" />
                        Presente
                      </Button>
                      <Button
                        size="sm"
                        variant={!attendanceData[student.group_participant_id] ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.group_participant_id, false)}
                        className={!attendanceData[student.group_participant_id] ? 'bg-red-500 hover:bg-red-600' : ''}
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
                  {saving ? (
                    <>
                      <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Asistencia"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedGroup && classes.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <IconCalendar className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-semibold">No hay clases programadas</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No se encontraron clases para el grupo seleccionado.
            </p>
          </div>
        </Card>
      )}

      {!selectedGroup && groups.length > 0 && (
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

      {groups.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <IconUsers className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-semibold">No tienes grupos asignados</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Actualmente no estás asignado como docente en ningún grupo.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}