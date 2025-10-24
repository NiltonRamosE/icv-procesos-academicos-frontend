// src/admin/components/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  UserCog, 
  Clock, 
  BookOpen,
  ArrowUpRight,
  Plus,
  UserCheck,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  pendingCourses: number;
  activeStudents: number;
  activeTeachers: number;
}

export function AdminPanel() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    pendingCourses: 0,
    activeStudents: 0,
    activeTeachers: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            totalStudents: data.data.total_students || 0,
            totalTeachers: data.data.total_teachers || 0,
            totalAdmins: data.data.total_admins || 0,
            pendingCourses: data.data.pending_courses || 0,
            activeStudents: data.data.active_students || 0,
            activeTeachers: data.data.active_teachers || 0
          });
        }
      } else {
        // Si la API no está disponible, mostrar datos de ejemplo
        setStats({
          totalStudents: 150,
          totalTeachers: 25,
          totalAdmins: 5,
          pendingCourses: 8,
          activeStudents: 142,
          activeTeachers: 22
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Datos de ejemplo en caso de error
      setStats({
        totalStudents: 150,
        totalTeachers: 25,
        totalAdmins: 5,
        pendingCourses: 8,
        activeStudents: 142,
        activeTeachers: 22
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color, 
    href 
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
    color: string;
    href?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {href && (
          <Button variant="ghost" size="sm" className="mt-2 h-8 px-2" asChild>
            <a href={href}>
              Gestionar <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const QuickAction = ({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    variant = "default" 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    variant?: "default" | "secondary" | "outline";
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
      <Button variant={variant} className="w-full h-auto p-4 justify-start" asChild>
        <a href={href}>
          <Icon className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </a>
      </Button>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestión completa de estudiantes, docentes, administradores y cursos
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <UserCheck className="w-3 h-3 mr-1" />
          Modo Administrador
        </Badge>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Estudiantes"
          value={stats.totalStudents}
          description={`${stats.activeStudents} activos`}
          icon={Users}
          color="text-blue-600"
          href="/academico/admin/estudiantes"
        />
        <StatCard
          title="Total Docentes"
          value={stats.totalTeachers}
          description={`${stats.activeTeachers} activos`}
          icon={GraduationCap}
          color="text-green-600"
          href="/academico/admin/docentes"
        />
        <StatCard
          title="Administradores"
          value={stats.totalAdmins}
          description="Usuarios con acceso admin"
          icon={UserCog}
          color="text-purple-600"
          href="/academico/admin/administradores"
        />
        <StatCard
          title="Cursos Pendientes"
          value={stats.pendingCourses}
          description="Esperando aprobación"
          icon={Clock}
          color="text-orange-600"
          href="/academico/admin/cursos-pendientes"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          title="Gestión Estudiantes"
          description="Ver, crear, editar estudiantes"
          icon={Users}
          href="/academico/admin/estudiantes"
        />
        <QuickAction
          title="Gestión Docentes"
          description="Administrar profesores e instructores"
          icon={GraduationCap}
          href="/academico/admin/docentes"
        />
        <QuickAction
          title="Administradores"
          description="Gestionar usuarios admin"
          icon={UserCog}
          href="/academico/admin/administradores"
        />
        <QuickAction
          title="Cursos Pendientes"
          description="Revisar y aprobar cursos"
          icon={BookOpen}
          href="/academico/admin/cursos-pendientes"
          variant="outline"
        />
        <QuickAction
          title="Nuevo Estudiante"
          description="Agregar nuevo estudiante"
          icon={Plus}
          href="/academico/admin/estudiantes/nuevo"
        />
        <QuickAction
          title="Nuevo Docente"
          description="Registrar nuevo docente"
          icon={Plus}
          href="/academico/admin/docentes/nuevo"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nuevo estudiante registrado</p>
                <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
              </div>
              <Badge variant="outline">Estudiante</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Curso enviado para aprobación</p>
                <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
              </div>
              <Badge variant="outline">Curso</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Docente actualizado</p>
                <p className="text-xs text-muted-foreground">Hace 1 hora</p>
              </div>
              <Badge variant="outline">Docente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}