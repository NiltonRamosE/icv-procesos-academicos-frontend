// components/student-attendance.tsx
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
import { config } from "config";

interface StudentAttendanceProps {
  token: string | null;
  user: any;
}

interface Group {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface AttendanceRecord {
  id: number;
  class_id: number;
  class_name: string;
  class_date: string;
  attended: boolean;
  observations: string | null;
  created_at: string;
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
    loadStudentGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadAttendanceRecords(selectedGroup);
    } else if (groups.length > 0) {
      setSelectedGroup(String(groups[0].id));
    }
  }, [selectedGroup, groups]);

  const loadStudentGroups = async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointStudentGroups = config.endpoints.groups.getGroupsByStudent.replace(':userId', user.id);
      const response = await fetch(`${config.apiUrl}${endpointStudentGroups}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar grupos del estudiante");
      }

      const data = await response.json();
      
      const groupsList: Group[] = data.map((groupItem: any) => ({
        id: groupItem.group.id,
        name: groupItem.group.name,
        code: groupItem.group.code,
        status: groupItem.group.status
      })) || [];

      setGroups(groupsList);
    } catch (error) {
      console.error("Error cargando grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async (groupId: string) => {
    if (!token || !user) return;

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpointAttendanceRecords = config.endpoints.attendance.getStudentAttendances.replace(':userId', user.id).replace(':groupId', groupId);
      const response = await fetch(
        `${config.apiUrl}${endpointAttendanceRecords}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar asistencias");
      }

      const data = await response.json();
      
      const records: AttendanceRecord[] = data.map((attendance: any) => ({
        id: attendance.id,
        class_id: attendance.class_id,
        class_name: attendance.class.class_name,
        class_date: attendance.class.class_date,
        attended: attendance.attended,
        observations: attendance.observations,
        created_at: attendance.created_at
      })) || [];

      setAttendanceRecords(records);
      
      // Calcular estadísticas
      const present = records.filter(r => r.attended).length;
      const absent = records.filter(r => !r.attended).length;
      const total = records.length;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      
      setStats({
        total_classes: total,
        present_count: present,
        absent_count: absent,
        late_count: 0, // Tu modelo actual no tiene campo para tardanzas
        attendance_percentage: Math.round(percentage * 10) / 10
      });
    } catch (error) {
      console.error("Error cargando asistencias:", error);
      setAttendanceRecords([]);
      setStats({
        total_classes: 0,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        attendance_percentage: 0
      });
    }
  };

  const getStatusBadge = (attended: boolean) => {
    if (attended) {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <IconUserCheck className="h-3 w-3 mr-1" />
          Presente
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <IconUserX className="h-3 w-3 mr-1" />
          Ausente
        </Badge>
      );
    }
  };

  const getGroupStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { label: 'Completado', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
      'in_progress': { label: 'En Progreso', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      'scheduled': { label: 'Programado', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      'cancelled': { label: 'Cancelado', className: 'bg-red-500/10 text-red-500 border-red-500/20' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;

    return (
      <Badge className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 75) return 'text-blue-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Componente personalizado para la barra de progreso con color dinámico
  const ColoredProgress = ({ value, className = "" }: { value: number; className?: string }) => {
    const colorClass = getProgressColor(value);
    
    return (
      <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
        <div
          className={`h-3 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    );
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
      {groups.length > 0 && (
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
                    <div className="flex items-center justify-between w-full">
                      <span>{group.name} ({group.code})</span>
                      {getGroupStatusBadge(group.status)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {stats && selectedGroup && (
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
                <ColoredProgress 
                  value={stats.attendance_percentage} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground">
                  {stats.attendance_percentage >= 90 
                    ? "¡Excelente! Mantienes una asistencia sobresaliente"
                    : stats.attendance_percentage >= 75
                    ? "¡Buen trabajo! Cumples con el requisito mínimo"
                    : stats.attendance_percentage >= 60
                    ? "Atención: Necesitas mejorar tu asistencia"
                    : "Advertencia: Tu asistencia está por debajo del mínimo recomendado"}
                </p>
              </div>

              {/* Estadísticas Detalladas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">Total Clases</p>
                  <p className="text-2xl font-bold">{stats.total_classes}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <IconUserCheck className="h-3 w-3 text-green-500" />
                    Presentes
                  </p>
                  <p className="text-2xl font-bold text-green-500">{stats.present_count}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <IconUserX className="h-3 w-3 text-red-500" />
                    Ausentes
                  </p>
                  <p className="text-2xl font-bold text-red-500">{stats.absent_count}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">Porcentaje</p>
                  <p className={`text-2xl font-bold ${getAttendanceColor(stats.attendance_percentage)}`}>
                    {stats.attendance_percentage}%
                  </p>
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
              {attendanceRecords.length > 0 ? (
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
                          <span>{formatDate(record.class_date)}</span>
                          {record.observations && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600">Observación: {record.observations}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {formatShortDate(record.class_date)}
                        </span>
                        {getStatusBadge(record.attended)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay registros de asistencia</h3>
                  <p className="text-muted-foreground">
                    No se encontraron asistencias registradas para este grupo.
                  </p>
                </div>
              )}
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
                    Para aprobar el curso necesitas mantener al menos un 75% de asistencia. 
                    Tu asistencia actual es del <strong>{stats.attendance_percentage}%</strong>.
                    {stats.attendance_percentage >= 75 
                      ? " ¡Vas por buen camino!"
                      : " Sigue esforzándote para alcanzar el objetivo."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {groups.length === 0 && !loading && (
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

      {selectedGroup && attendanceRecords.length === 0 && !loading && groups.length > 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <IconCalendar className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-semibold">No hay asistencias registradas</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No se han registrado asistencias para este grupo aún.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}