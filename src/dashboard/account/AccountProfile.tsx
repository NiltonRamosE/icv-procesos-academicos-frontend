import { useState, useEffect } from "react";
import { AppSidebar } from "@/shared/app-sidebar";
import { SiteHeader } from "@/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconCheck, 
  IconAlertCircle, 
  IconUser, 
  IconMail, 
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCamera,
  IconLoader
} from "@tabler/icons-react";
import { config } from "config";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  birth_date?: string;
  profile_photo?: string;
  role: string;
}

export default function AccountProfile() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    birth_date: "",
    profile_photo: "",
    role: ""
  });

  useEffect(() => {
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    setToken(t ?? null);
    try { 
      const userData = u ? JSON.parse(u) : null;
      setUser(userData);
      if (userData) {
        setFormData({
          id: userData.id || 0,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "Perú",
          birth_date: userData.birth_date || "",
          profile_photo: userData.profile_photo || "/academico/images/9440461.webp",
          role: userData.role || "student"
        });
      }
    } catch { 
      setUser(null); 
    }
    setMounted(true);
    setLoading(false);
  }, []);

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');

        const response = await fetch(`${config.apiUrl}/api/profile`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone, // Laravel usa phone_number
            address: formData.address,
            city: formData.city,
            country: formData.country,
            birth_date: formData.birth_date,
            profile_photo: formData.profile_photo
        })
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el perfil.");
        }

        const updatedUser = await response.json();

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setMessage({
        type: 'success',
        text: "¡Perfil actualizado exitosamente!"
        });
        setIsEditing(false);
        setTimeout(() => setMessage(null), 3000);
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        setMessage({
        type: 'error',
        text: "Error al actualizar el perfil. Por favor, intenta nuevamente."
        });
    } finally {
        setSaving(false);
    }
};

  useEffect(() => {
  const t = window.localStorage.getItem("token");
  if (!t) return;
  
  const tokenWithoutQuotes = t.replace(/^"|"$/g, '');

  fetch(`${config.apiUrl}/api/profile`, {
    headers: {
      "Authorization": `Bearer ${tokenWithoutQuotes}`,
      "Accept": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => setFormData(data))
    .catch(err => console.error("Error al cargar perfil:", err));
}, []);



  const handleCancel = () => {
    // Restaurar datos originales
    if (user) {
      setFormData({
        id: user.id || 0,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "Perú",
        birth_date: user.birth_date || "",
        profile_photo: user.profile_photo || "/academico/images/9440461.webp",
        role: user.role || "student"
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      student: "Estudiante",
      teacher: "Docente",
      admin: "Administrador",
      graduate: "Egresado"
    };
    return roles[role] || role;
  };

  if (!mounted || loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" token={token} user={user}/>
        <SidebarInset>
          <SiteHeader title="Mi Cuenta"/>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <IconLoader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando información del perfil...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader title="Mi Cuenta"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <section className="px-4 md:px-6 lg:px-10 max-w-5xl mx-auto w-full">
                <div className="space-y-6">
                  
                  {/* Mensajes de feedback */}
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

                  {/* Header con Avatar y Info Básica */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src={formData.profile_photo} alt={formData.first_name} />
                            <AvatarFallback className="text-3xl">
                              {formData.first_name?.[0]}{formData.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <button 
                              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                              type="button"
                            >
                              <IconCamera className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                          <h2 className="text-3xl font-bold">
                            {formData.first_name} {formData.last_name}
                          </h2>
                          <p className="text-muted-foreground text-lg">{formData.email}</p>
                          <div className="flex gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                              {getRoleLabel(formData.role)}
                            </span>
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20">
                              Cuenta Activa
                            </span>
                          </div>
                        </div>

                        {!isEditing && (
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="mt-4 md:mt-0"
                          >
                            Editar Perfil
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formulario de Información Personal */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconUser className="h-5 w-5 text-primary" />
                          Información Personal
                        </CardTitle>
                        <CardDescription>
                          {isEditing ? "Actualiza tu información personal" : "Tu información personal"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">Nombre(s) *</Label>
                            <Input
                              id="first_name"
                              placeholder="Juan"
                              value={formData.first_name}
                              onChange={(e) => handleChange("first_name", e.target.value)}
                              disabled={!isEditing}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="last_name">Apellido(s) *</Label>
                            <Input
                              id="last_name"
                              placeholder="Pérez García"
                              value={formData.last_name}
                              onChange={(e) => handleChange("last_name", e.target.value)}
                              disabled={!isEditing}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">
                            <div className="flex items-center gap-2">
                              <IconMail className="h-4 w-4" />
                              Correo Electrónico *
                            </div>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="juan.perez@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            disabled={!isEditing}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">
                              <div className="flex items-center gap-2">
                                <IconPhone className="h-4 w-4" />
                                Teléfono
                              </div>
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+51 999 999 999"
                              value={formData.phone}
                              onChange={(e) => handleChange("phone", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="birth_date">
                              <div className="flex items-center gap-2">
                                <IconCalendar className="h-4 w-4" />
                                Fecha de Nacimiento
                              </div>
                            </Label>
                            <Input
                              id="birth_date"
                              type="date"
                              value={formData.birth_date}
                              onChange={(e) => handleChange("birth_date", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconMapPin className="h-5 w-5 text-primary" />
                          Ubicación
                        </CardTitle>
                        <CardDescription>
                          {isEditing ? "Actualiza tu dirección" : "Tu dirección actual"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            placeholder="Av. Ejemplo 123, Dpto. 456"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input
                              id="city"
                              placeholder="Lima"
                              value={formData.city}
                              onChange={(e) => handleChange("city", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country">País</Label>
                            <Input
                              id="country"
                              placeholder="Perú"
                              value={formData.country}
                              onChange={(e) => handleChange("country", e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {isEditing && (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={saving}
                        >
                          {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                      </div>
                    )}
                  </form>

                  {/* Tarjeta informativa */}
                  <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-blue-500/10 rounded-lg">
                            <IconUser className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Protege tu información</h4>
                          <p className="text-sm text-muted-foreground">
                            Mantén tus datos actualizados para mejorar tu experiencia en la plataforma.
                            Si necesitas cambiar tu contraseña o cerrar tu cuenta, contacta con soporte.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </section>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}