import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { IconLoader2, IconUserCheck, IconSchool } from "@tabler/icons-react";


// Importar secciones
import TeacherAttendance from "@/dashboard/attendance/sections/TeacherAttendance";
import StudentAttendance from "@/dashboard/attendance/sections/StudentAttendance";

export default function AttendanceModule() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  //Cargar token y usuario desde localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.warn("Error parsing user data from localStorage");
      }
    }
    setLoading(false);
  }, []);

  // Loader mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <IconLoader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando módulo de asistencia...</p>
        </div>
      </div>
    );
  }

  // Validaciones básicas
  if (!token || !user) {
    return (
      <Card className="mx-auto max-w-md mt-12">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">⚠️ No se encontró sesión activa.</p>
          <p className="text-sm">Por favor, inicia sesión nuevamente para acceder a la asistencia.</p>
        </CardContent>
      </Card>
    );
  }

  // 🔹 4. Determinar rol
  const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.is_teacher;
  const isStudent = user?.role?.toLowerCase() === "student" || user?.is_student;

  //Render principal
  return (
    <section className="px-4 md:px-6 lg:px-10 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Asistencia</h1>

      {/* Tabs solo visibles si tiene más de un rol */}
      {isTeacher && isStudent ? (
        <Tabs defaultValue="student" className="space-y-6">
          <TabsList>
            <TabsTrigger value="student" className="flex items-center gap-2">
              <IconSchool className="h-4 w-4" /> Alumno
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <IconUserCheck className="h-4 w-4" /> Docente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <StudentAttendance token={token} user={user} />
          </TabsContent>

          <TabsContent value="teacher">
            <TeacherAttendance token={token} user={user} />
          </TabsContent>
        </Tabs>
      ) : isTeacher ? (
        <TeacherAttendance token={token} user={user} />
      ) : (
        <StudentAttendance token={token} user={user} />
      )}
    </section>
  );
}