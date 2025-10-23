import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner"; // o "react-hot-toast" según tu setup

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
  group_participant_id: number; // 🔹 ID real usado por backend
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

  const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');

  // 🔹 1. Cargar grupos (docente)
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.apiUrl}/api/groups`, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
          },
        });
        const data = await res.json();
        setGroups(data);
      } catch (error) {
        console.error("Error cargando grupos:", error);
        toast.error("Error al cargar los grupos");
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  // 🔹 2. Cargar clases según grupo
  useEffect(() => {
    if (!selectedGroup) return;
    const loadClasses = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/api/classes/group/${selectedGroup}`, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
          },
        });
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error("Error cargando clases:", error);
        toast.error("Error al cargar las clases");
      }
    };
    loadClasses();
  }, [selectedGroup]);

  // 🔹 3. Cargar estudiantes por clase
  useEffect(() => {
    if (!selectedClass) return;
    const loadStudents = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/api/group-participants?class_id=${selectedClass}`, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
          },
        });
        const data = await res.json();

        // Mapeamos al formato del front
        const mapped = data.map((s: any) => ({
          id: s.user.id,
          name: `${s.user.first_name} ${s.user.last_name}`,
          email: s.user.email,
          photo: s.user.profile_photo || "/images/default-avatar.webp",
          group_participant_id: s.id,
        }));

        setStudents(mapped);

        // Inicializamos asistencia
        const initial: Record<number, 'present' | 'absent' | 'late'> = {};
        mapped.forEach((s: any) => (initial[s.id] = 'absent'));
        setAttendanceData(initial);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
        toast.error("Error al cargar los estudiantes");
      }
    };
    loadStudents();
  }, [selectedClass]);

  // 🔹 4. Cambiar estado individual
  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  // 🔹 5. Marcar todos presentes
  const handleMarkAllPresent = () => {
    const allPresent: Record<number, 'present' | 'absent' | 'late'> = {};
    students.forEach(s => (allPresent[s.id] = 'present'));
    setAttendanceData(allPresent);
  };

  // 🔹 6. Enviar asistencias al backend
  const handleSubmitAttendance = async () => {
    if (!selectedClass) {
      setMessage({ type: 'error', text: "Selecciona una clase antes de guardar" });
      return;
    }

    setSaving(true);
    try {
      const requests = students.map((s) => {
        const attended = attendanceData[s.id] === 'present' || attendanceData[s.id] === 'late';
        return fetch(`${config.apiUrl}/api/attendances`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            group_participant_id: s.group_participant_id,
            class_id: selectedClass,
            attended,
            observations: attendanceData[s.id] === 'late' ? "Llegó tarde" : null,
          }),
        });
      });

      await Promise.all(requests);
      setMessage({ type: 'success', text: "¡Asistencia registrada exitosamente!" });
      toast.success("Asistencia guardada correctamente ✅");
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      setMessage({ type: 'error', text: "Error al guardar la asistencia." });
      toast.error("Error al registrar la asistencia ❌");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 🔹 7. Estadísticas
  const stats = {
    present: Object.values(attendanceData).filter(s => s === 'present').length,
    absent: Object.values(attendanceData).filter(s => s === 'absent').length,
    late: Object.values(attendanceData).filter(s => s === 'late').length,
  };

  // 🔹 8. Render
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
          {message.type === 'success' ? <IconCheck className="h-4 w-4" /> : <IconAlertCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === 'success' ? '¡Éxito!' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Registro de Asistencia</h2>
        <p className="text-muted-foreground">Marca la asistencia de los estudiantes para cada clase</p>
      </div>

      {/* Selectores de Grupo y Clase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grupo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger><SelectValue placeholder="Elige un grupo" /></SelectTrigger>
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

        {/* Clase */}
        <Card>
          <CardHeader><CardTitle className="text-base">Seleccionar Clase</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedGroup}>
              <SelectTrigger><SelectValue placeholder="Elige una clase" /></SelectTrigger>
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

      {/* Tabla de estudiantes */}
      {selectedClass && students.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Lista de Estudiantes</h3>
            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
              <IconCheckbox className="h-4 w-4 mr-2" /> Marcar Todos Presentes
            </Button>
          </div>

          <Card className="mt-4">
            <CardContent className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.photo} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === 'present' ? 'default' : 'outline'}
                      onClick={() => handleAttendanceChange(student.id, 'present')}
                      className={attendanceData[student.id] === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      <IconUserCheck className="h-4 w-4 mr-1" /> Presente
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === 'late' ? 'default' : 'outline'}
                      onClick={() => handleAttendanceChange(student.id, 'late')}
                      className={attendanceData[student.id] === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                      <IconClock className="h-4 w-4 mr-1" /> Tarde
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleAttendanceChange(student.id, 'absent')}
                      className={attendanceData[student.id] === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      <IconUserX className="h-4 w-4 mr-1" /> Ausente
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleSubmitAttendance} disabled={saving} className="w-full" size="lg">
                  {saving ? "Guardando..." : "Guardar Asistencia"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
