import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { SiteHeader } from "@/dashboard/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

type SectionType = 'historial' | 'crear-grupo' | 'crear-curso' | 'default';

export default function Courses() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('default');
  const [completedGroups, setCompletedGroups] = useState<any[]>([]);

  useEffect(() => {
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    setToken(t ?? null);
    try { setUser(u ? JSON.parse(u) : null); } catch { setUser(null); }
    setMounted(true);
  }, []);

  // Detectar cambios en la URL hash para cambiar de sección
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'historial') {
        setActiveSection('historial');
      } else if (hash === 'crear-grupo') {
        setActiveSection('crear-grupo');
      } else if (hash === 'crear-curso') {
        setActiveSection('crear-curso');
      } else {
        setActiveSection('default');
      }
    };

    handleHashChange(); // Ejecutar al montar
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simular carga de grupos completados
  useEffect(() => {
    if (activeSection === 'historial') {
      // Aquí harías el fetch a tu API
      // fetch(`/api/groups?user_id=${user?.id}&status=completed`)
      setCompletedGroups([
        {
          id: 1,
          name: "Grupo A - Mañana",
          course: {
            name: "Desarrollo Web Fullstack",
            image: "/images/default-group-01.webp"
          },
          teacher: {
            name: "Juan Pérez",
            photo: "/images/9439727.webp"
          },
          start_date: "2023-07-15",
          end_date: "2023-12-15",
          progress: 100
        },
        {
          id: 2,
          name: "Grupo B - Tarde",
          course: {
            name: "Python Avanzado",
            image: "/images/default-group-02.webp"
          },
          teacher: {
            name: "María González",
            photo: "/images/9439729.webp"
          },
          start_date: "2023-06-01",
          end_date: "2023-11-30",
          progress: 100
        }
      ]);
    }
  }, [activeSection, user]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el grupo
    console.log("Creando grupo...");
    // Después de crear, podrías redirigir o mostrar un mensaje
  };

  if (!mounted) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        token={token} 
        user={user}
      />
      <SidebarInset>
        <SiteHeader title={
          activeSection === 'historial' ? 'Historial de Cursos' :
          activeSection === 'crear-grupo' ? 'Crear Grupo' :
          activeSection === 'crear-curso' ? 'Crear Curso' :
          'Mis Cursos'
        }/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Sección por defecto: Mis Cursos */}
              {activeSection === 'default' && (
                <section className="px-4 md:px-6 lg:px-10">
                  <p className="text-muted-foreground">
                    Vista principal de "Mis Cursos". Aquí se mostrarán los cursos activos del usuario.
                  </p>
                </section>
              )}

              {/* Sección: Historial de Cursos */}
              {activeSection === 'historial' && (
                <section className="px-4 md:px-6 lg:px-10">
                  {completedGroups.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                      No tienes cursos completados aún.
                    </p>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {completedGroups.map((group) => (
                        <Card 
                          key={group.id} 
                          className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                          onClick={() => {
                            window.location.href = `/groups/${group.id}`;
                          }}
                        >
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={group.course.image}
                              alt={group.course.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.course.name}
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={group.teacher.photo} />
                                <AvatarFallback>
                                  {group.teacher.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm font-medium">{group.teacher.name}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Completado</span>
                                <span className="text-green-600 font-medium">100%</span>
                              </div>
                              <Progress value={100} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Sección: Crear Grupo */}
              {activeSection === 'crear-grupo' && (
                <section className="px-4 md:px-6 lg:px-10">
                  <div className="max-w-2xl mx-auto">
                    <Card>
                      <CardHeader>
                        <h2 className="text-2xl font-bold">Crear Nuevo Grupo</h2>
                        <p className="text-sm text-muted-foreground">
                          Completa la información para crear un nuevo grupo académico
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateGroup} className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="course">Curso</Label>
                            <Select>
                              <SelectTrigger id="course">
                                <SelectValue placeholder="Selecciona un curso" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Desarrollo Web Fullstack</SelectItem>
                                <SelectItem value="2">Python Avanzado</SelectItem>
                                <SelectItem value="3">React y TypeScript</SelectItem>
                                <SelectItem value="4">Node.js y Express</SelectItem>
                                <SelectItem value="5">Data Science con Python</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="code">Código del Grupo</Label>
                            <Input 
                              id="code" 
                              placeholder="Ej: GRP-2024-001" 
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Grupo</Label>
                            <Input 
                              id="name" 
                              placeholder="Ej: Grupo A - Mañana" 
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="start_date">Fecha de Inicio</Label>
                              <Input 
                                id="start_date" 
                                type="date" 
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end_date">Fecha de Fin</Label>
                              <Input 
                                id="end_date" 
                                type="date" 
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="minimum_enrolled">Mínimo de Inscritos</Label>
                            <Input 
                              id="minimum_enrolled" 
                              type="number" 
                              placeholder="15" 
                              min="1"
                              required
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button 
                              type="button"
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.location.hash = ''}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit"
                              className="flex-1"
                            >
                              Crear Grupo
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

              {/* Sección: Crear Curso */}
              {activeSection === 'crear-curso' && (
                <section className="px-4 md:px-6 lg:px-10">
                  <div className="max-w-3xl mx-auto">
                    <Card>
                      <CardHeader>
                        <h2 className="text-2xl font-bold">Crear Nuevo Curso</h2>
                        <p className="text-sm text-muted-foreground">
                          Define la información del curso que será utilizado para crear grupos
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateGroup} className="space-y-6">
                          {/* Información Básica */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Información Básica</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="course_id">ID del Curso</Label>
                                <Input 
                                  id="course_id" 
                                  type="number"
                                  placeholder="1001" 
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input 
                                  id="title" 
                                  placeholder="Desarrollo Web Fullstack" 
                                  maxLength={255}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="name">Nombre (opcional)</Label>
                              <Input 
                                id="name" 
                                placeholder="DWF 2024" 
                                maxLength={200}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">Descripción</Label>
                              <textarea 
                                id="description" 
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe el contenido, objetivos y metodología del curso..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="level">Nivel *</Label>
                              <Select defaultValue="basic">
                                <SelectTrigger id="level">
                                  <SelectValue placeholder="Selecciona un nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Básico</SelectItem>
                                  <SelectItem value="intermediate">Intermedio</SelectItem>
                                  <SelectItem value="advanced">Avanzado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Multimedia */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Multimedia</h3>
                            
                            <div className="space-y-2">
                              <Label htmlFor="course_image">URL de Imagen del Curso</Label>
                              <Input 
                                id="course_image" 
                                type="url" 
                                placeholder="https://ejemplo.com/curso.jpg"
                                maxLength={255}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="video_url">URL de Video Promocional</Label>
                              <Input 
                                id="video_url" 
                                type="url" 
                                placeholder="https://youtube.com/watch?v=..."
                                maxLength={255}
                              />
                            </div>
                          </div>

                          {/* Detalles del Curso */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Detalles del Curso</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="duration">Duración (horas)</Label>
                                <Input 
                                  id="duration" 
                                  type="number" 
                                  step="0.01"
                                  placeholder="120.5" 
                                  min="0"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sessions">Número de Sesiones</Label>
                                <Input 
                                  id="sessions" 
                                  type="number" 
                                  placeholder="40"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Precios */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Precios</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="selling_price">Precio de Venta</Label>
                                <Input 
                                  id="selling_price" 
                                  type="number" 
                                  step="0.01"
                                  placeholder="299.99"
                                  min="0"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="discount_price">Precio con Descuento</Label>
                                <Input 
                                  id="discount_price" 
                                  type="number" 
                                  step="0.01"
                                  placeholder="199.99"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Prerrequisitos */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Prerrequisitos</h3>
                            
                            <div className="space-y-2">
                              <Label htmlFor="prerequisites">Cursos Prerrequisitos</Label>
                              <Select>
                                <SelectTrigger id="prerequisites">
                                  <SelectValue placeholder="Selecciona cursos prerrequisitos (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sin prerrequisitos</SelectItem>
                                  <SelectItem value="1">HTML y CSS Básico</SelectItem>
                                  <SelectItem value="2">JavaScript Fundamentals</SelectItem>
                                  <SelectItem value="3">Introducción a la Programación</SelectItem>
                                  <SelectItem value="4">Git y Control de Versiones</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Los prerrequisitos ayudan a los estudiantes a saber qué conocimientos previos necesitan
                              </p>
                            </div>
                          </div>

                          {/* Certificación */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Certificación</h3>
                            
                            <div className="space-y-2">
                              <Label htmlFor="certificate_issuer">Emisor del Certificado</Label>
                              <Input 
                                id="certificate_issuer" 
                                placeholder="Universidad Incadev"
                                maxLength={255}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button 
                              type="button"
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.location.hash = ''}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit"
                              className="flex-1"
                            >
                              Crear Curso
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}