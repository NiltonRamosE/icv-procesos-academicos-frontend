// components/participants-tab.tsx
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { 
  IconUsers, 
  IconSearch, 
  IconMail, 
  IconPhone,
  IconUser,
  IconLoader,
  IconPlus,
  IconCrown,
  IconCalendar,
  IconMapPin,
  IconGenderMale,
  IconGenderFemale
} from "@tabler/icons-react";
import { config } from "config";

interface ParticipantsTabProps {
  groupId: string;
  token: string | null;
  isTeacher?: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dni: string;
  document: string;
  email: string;
  email_verified_at: string;
  phone_number: string;
  address: string;
  birth_date: string;
  role: string[];
  gender: string;
  country: string;
  country_location: string;
  timezone: string;
  profile_photo: string | null;
  status: string;
  synchronized: boolean;
  last_access_ip: string | null;
  last_access: string | null;
  last_connection: string | null;
  created_at: string;
  updated_at: string;
}

interface GroupData {
  group: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    start_date: string;
    end_date: string;
    participants: {
      teacher: User;
      students: User[];
    };
  };
}

export default function ParticipantsTab({ groupId, token, isTeacher = false }: ParticipantsTabProps) {
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.getById}`.replace(":id", groupId);

      console.log("Cargando datos del grupo desde:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API:", data);
      
      setGroupData(data);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Obtener participantes
  const teacher = groupData?.group?.participants?.teacher;
  const students = groupData?.group?.participants?.students || [];

  // Filtrar participantes por búsqueda
  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon?: React.ReactNode }> = {
      'teacher': { 
        label: 'Docente', 
        variant: 'default',
        icon: <IconCrown className="h-3 w-3 mr-1" />
      },
      'student': { 
        label: 'Estudiante', 
        variant: 'outline' 
      }
    };

    const roleInfo = roleMap[role] || { label: role, variant: 'outline' };
    
    return (
      <Badge variant={roleInfo.variant} className="flex items-center gap-1">
        {roleInfo.icon}
        {roleInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'active': { label: 'Activo', variant: 'default' },
      'inactive': { label: 'Inactivo', variant: 'outline' },
      'completed': { label: 'Completado', variant: 'default' },
      'scheduled': { label: 'Programado', variant: 'secondary' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'female' ? 
      <IconGenderFemale className="h-3 w-3" /> : 
      <IconGenderMale className="h-3 w-3" />;
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleAddParticipant = () => {
    // TODO: Implementar modal para agregar participante
    console.log("Agregar nuevo participante");
  };

  const handleSendMessage = (participant: User) => {
    // TODO: Implementar envío de mensaje
    console.log("Enviar mensaje a:", participant.full_name);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando participantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Button onClick={loadGroupData}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Participantes del Grupo</h2>
          <p className="text-muted-foreground mt-1">
            {1 + students.length} {1 + students.length === 1 ? 'participante' : 'participantes'} en total
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Barra de búsqueda */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Botón agregar (solo para docentes) */}
          {isTeacher && (
            <Button onClick={handleAddParticipant} className="flex items-center gap-2">
              <IconPlus className="h-4 w-4" />
              Agregar
            </Button>
          )}
        </div>
      </div>

      {/* Información del Grupo */}
      {groupData?.group && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{groupData.group.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconCalendar className="h-4 w-4" />
                    <span>
                      {new Date(groupData.group.start_date).toLocaleDateString('es-PE')} - {new Date(groupData.group.end_date).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <div>
                    Estado: <Badge variant="outline">{getStatusBadge(groupData.group.status)}</Badge>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {groupData.group.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{1 + students.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <IconUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Docentes</p>
                <p className="text-2xl font-bold">{teacher ? 1 : 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <IconCrown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <IconUser className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Docente */}
      {teacher && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconCrown className="h-5 w-5 text-yellow-600" />
            <h3 className="text-xl font-semibold">Docente</h3>
            <Badge variant="outline" className="ml-2">
              1
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header con Avatar e Info */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-yellow-200">
                      <AvatarImage src={teacher.profile_photo || ""} />
                      <AvatarFallback className="bg-yellow-100 text-yellow-800">
                        {getInitials(teacher.first_name, teacher.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold truncate">{teacher.full_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge('teacher')}
                            {getStatusBadge(teacher.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconMail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    {teacher.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconPhone className="h-4 w-4 flex-shrink-0" />
                        <span>{teacher.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconMapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{teacher.country_location}, {teacher.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getGenderIcon(teacher.gender)}
                      <span>{teacher.gender === 'male' ? 'Hombre' : 'Mujer'} • {calculateAge(teacher.birth_date)} años</span>
                    </div>
                    {teacher.dni && (
                      <div className="text-xs text-muted-foreground">
                        DNI: {teacher.dni}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSendMessage(teacher)}
                    >
                      <IconMail className="h-4 w-4 mr-1" />
                      Mensaje
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Estudiantes */}
      {students.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconUser className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Estudiantes</h3>
            <Badge variant="outline" className="ml-2">
              {filteredStudents.length}
            </Badge>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header con Avatar e Info */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-blue-200">
                          <AvatarImage src={student.profile_photo || ""} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(student.first_name, student.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold truncate">{student.full_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getRoleBadge('student')}
                                {getStatusBadge(student.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconMail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconPhone className="h-4 w-4 flex-shrink-0" />
                            <span>{student.phone_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconMapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{student.country_location}, {student.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {getGenderIcon(student.gender)}
                          <span>{student.gender === 'male' ? 'Hombre' : 'Mujer'} • {calculateAge(student.birth_date)} años</span>
                        </div>
                        {student.dni && (
                          <div className="text-xs text-muted-foreground">
                            DNI: {student.dni}
                          </div>
                        )}
                      </div>

                      {/* Fecha de registro */}
                      <div className="text-xs text-muted-foreground">
                        Registrado el {new Date(student.created_at).toLocaleDateString('es-PE')}
                      </div>

                      {/* Acciones (solo para docentes) */}
                      {isTeacher && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleSendMessage(student)}
                          >
                            <IconMail className="h-4 w-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron estudiantes</h3>
                <p className="text-muted-foreground mt-1">
                  No hay resultados para "{searchTerm}"
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Limpiar búsqueda
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!teacher && students.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <IconUsers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No hay participantes</h3>
            <p className="text-muted-foreground mt-2">
              {isTeacher 
                ? "Comienza agregando participantes al grupo" 
                : "Aún no hay participantes en este grupo"
              }
            </p>
            {isTeacher && (
              <Button onClick={handleAddParticipant} className="mt-4">
                <IconPlus className="h-4 w-4 mr-2" />
                Agregar Primer Participante
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}