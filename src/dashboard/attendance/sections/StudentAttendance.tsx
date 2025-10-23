import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  IconUserCheck, 
  IconUserX,
  IconClock,
  IconCalendar,
  IconLoader,
  IconTrendingUp,
  IconPercentage
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentAttendanceProps {
  token: string | null;
  user: any;
}

interface Group {
  id: number;
  name: string;
  course_name: string;
}

interface AttendanceRecord {
  id: number;
  class_name: string;
  class_date: string;
  status: 'present' | 'absent' | 'late';
  marked_at: string;
}

interface AttendanceStats {
  total_classes: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

export default function StudentAttendance({ token, user }: StudentAttendanceProps) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadAttendanceRecords(selectedGroup);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const groupsList: Group[] = [
        { id: 1, name: "Grupo A - Mañana", course_name: "Desarrollo Web Full Stack" },
        { id: 2, name: "Grupo B - Tarde", course_name: "Python Avanzado" }
      ];
      
      setGroups(groupsList);
      
      // Auto-seleccionar el primer grupo
      if (groupsList.length > 0) {
        setSelectedGroup(String(groupsList[0].id));
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async (groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const records: AttendanceRecord[] = [
        { id: 1, class_name: "Introducción a React", class_date: "2025-10-15", status: 'present', marked_at: "2025-10-15 10:05:00" },
        { id: 2, class_name: "Componentes y Props", class_date: "2025-10-17", status: 'present', marked_at: "2025-10-17 10:02:00" },
        { id: 3, class_name: "State y Hooks", class_date: "2025-10-19", status: 'late', marked_at: "2025-10-19 10:15:00" },
        { id: 4, class_name: "Manejo de Eventos", class_date: "2025-10-20", status: 'present', marked_at: "2025-10-20 10:03:00" },
        { id: 5, class_name: "Formularios en React", class_date: "2025-10-22", status: 'absent', marked_at: "2025-10-22 12:00:00" }
      ];
      
      setAttendanceRecords(records);
      
      // Calcular estadísticas
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const total = records.length;
      const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;
      
      setStats({
        total_classes: total,
        present_count: present,
        absent_count: absent,
        late_count: late,
        attendance_percentage: Math.round(percentage * 10) / 10
      });
    } catch (error) {
      console.error("Error cargando asistencias:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <IconUserCheck className="h-3 w-3 mr-1" />
            Presente
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <IconClock className="h-3 w-3 mr-1" />
            Tardanza
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <IconUserX className="h-3 w-3 mr-1" />
            Ausente
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 75) return 'text-blue-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconLoader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Mi Asistencia</h2>
        <p className="text-muted-foreground">
          Consulta tu registro de asistencias a las clases
        </p>
      </div>

      {/* Selector de Grupo */}
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

      {stats && (
        <>
          {/* Estadísticas Generales */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Asistencia</CardTitle>
              <CardDescription>
                Tu desempeño en el grupo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Porcentaje de Asistencia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Porcentaje de Asistencia</span>
                  <span className={`text-2xl font-bold ${getAttendanceColor(stats.attendance_percentage)}`}>
                    {stats.attendance_percentage}%
                  </span>
                </div>
                <Progress value={stats.attendance_percentage} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {stats.attendance_percentage >= 75 
                    ? "¡Excelente! Mantienes una buena asistencia"
                    : stats.attendance_percentage >= 60
                    ? "Atención: Necesitas mejorar tu asistencia"
                    : "Advertencia: Tu asistencia está por debajo del mínimo"}
                </p>
              </div>

              {/* Estadísticas Detalladas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Clases</p>
                  <p className="text-2xl font-bold">{stats.total_classes}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconUserCheck className="h-3 w-3 text-green-500" />
                    Presentes
                  </p>
                  <p className="text-2xl font-bold text-green-500">{stats.present_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconClock className="h-3 w-3 text-amber-500" />
                    Tardanzas
                  </p>
                  <p className="text-2xl font-bold text-amber-500">{stats.late_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconUserX className="h-3 w-3 text-red-500" />
                    Ausentes
                  </p>
                  <p className="text-2xl font-bold text-red-500">{stats.absent_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Asistencias */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Asistencias</CardTitle>
              <CardDescription>
                Registro detallado de tus asistencias por clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{record.class_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(record.class_date).toLocaleDateString('es-PE', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                        <span>•</span>
                        <span>Registrado: {new Date(record.marked_at).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta Informativa */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <IconPercentage className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">Requisito de Asistencia</h4>
                  <p className="text-sm text-muted-foreground">
                    Recuerda que necesitas mantener al menos un 75% de asistencia para aprobar el curso.
                    Las tardanzas cuentan como media asistencia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedGroup && groups.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <IconUserCheck className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-semibold">No hay grupos disponibles</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aún no estás inscrito en ningún grupo. Explora el catálogo de cursos para comenzar.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}