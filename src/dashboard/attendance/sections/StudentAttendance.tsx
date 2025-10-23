import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconAlertCircle, IconCheck, IconClock, IconUserCheck, IconUserX, IconLoader2 } from "@tabler/icons-react";
import { config } from "config";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  class_name: string;
  class_date: string;
  status: "present" | "absent" | "late";
  marked_at: string;
}

interface Group {
  id: number;
  name: string;
  course_name: string;
}

interface StudentAttendanceProps {
  token: string | null;
  user: any;
}

export default function StudentAttendance({ token, user }: StudentAttendanceProps) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  const tokenWithoutQuotes = token?.replace(/^"|"$/g, "");

  // 🔹 1. Cargar grupos del estudiante
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/api/groups/completed/${user.id}`, {
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
      }
    };
    loadGroups();
  }, []);

  // 🔹 2. Cargar asistencias del grupo seleccionado
  useEffect(() => {
    if (!selectedGroup) return;
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.apiUrl}/api/attendances`, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json",
          },
        });
        const data = await res.json();

        // Filtramos solo las asistencias del grupo seleccionado
        const filtered = data.filter(
          (a: any) => a.group_participant?.group_id === Number(selectedGroup)
        );

        // Mapeamos al formato del front
        const mapped = filtered.map((a: any) => ({
          id: a.id,
          class_name: a.class.class_name,
          class_date: a.class.class_date,
          status: a.attended ? "present" : "absent",
          marked_at: a.updated_at,
        }));

        setAttendanceRecords(mapped);

        // Recalcular estadísticas
        const counts = { present: 0, absent: 0, late: 0 };
        mapped.forEach((r: AttendanceRecord) => {
          if (r.status === "present") counts.present++;
          if (r.status === "absent") counts.absent++;
          if (r.status === "late") counts.late++;
        });
        setStats(counts);
      } catch (error) {
        console.error("Error cargando asistencias:", error);
        toast.error("Error al cargar asistencias");
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [selectedGroup]);

  // 🔹 3. Calcular porcentajes
  const total = stats.present + stats.absent + stats.late;
  const presentPct = total ? Math.round((stats.present / total) * 100) : 0;
  const absentPct = total ? Math.round((stats.absent / total) * 100) : 0;
  const latePct = total ? Math.round((stats.late / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconLoader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Historial de Asistencia</h2>
        <p className="text-muted-foreground">Consulta tus asistencias por grupo</p>
      </div>

      {/* Selector de Grupo */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Grupo</CardTitle>
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

      {/* Estadísticas */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Asistencias Completas</span>
              <span className="font-semibold text-green-600">{presentPct}%</span>
            </div>
            <Progress value={presentPct} className="bg-green-200" />

            <div className="flex items-center justify-between text-sm">
              <span>Ausencias</span>
              <span className="font-semibold text-red-600">{absentPct}%</span>
            </div>
            <Progress value={absentPct} className="bg-red-200" />

            <div className="flex items-center justify-between text-sm">
              <span>Tardanzas</span>
              <span className="font-semibold text-amber-600">{latePct}%</span>
            </div>
            <Progress value={latePct} className="bg-amber-200" />
          </CardContent>
        </Card>
      )}

      {/* Lista de asistencias */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Asistencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendanceRecords.length === 0 ? (
              <Alert>
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>Sin registros</AlertTitle>
                <AlertDescription>
                  No se encontraron asistencias registradas para este grupo.
                </AlertDescription>
              </Alert>
            ) : (
              attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-medium">{record.class_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.class_date).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status === "present" && (
                      <div className="flex items-center text-green-600">
                        <IconUserCheck className="h-4 w-4 mr-1" /> Presente
                      </div>
                    )}
                    {record.status === "absent" && (
                      <div className="flex items-center text-red-600">
                        <IconUserX className="h-4 w-4 mr-1" /> Ausente
                      </div>
                    )}
                    {record.status === "late" && (
                      <div className="flex items-center text-amber-600">
                        <IconClock className="h-4 w-4 mr-1" /> Tarde
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
