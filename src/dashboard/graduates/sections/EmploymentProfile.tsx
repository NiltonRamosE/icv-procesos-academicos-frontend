// Archivo: src/dashboard/graduates/sections/EmploymentProfile.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconCheck, IconAlertCircle, IconBriefcase, IconBuilding, IconCurrencyDollar, IconCalendar } from "@tabler/icons-react";

interface EmploymentProfileProps {
  token: string | null;
  user: any;
}

interface EmploymentData {
  employment_status: string;
  company_name: string;
  position: string;
  start_date: string;
  salary_range: string;
  industry: string;
  is_related_to_studies: boolean;
}

export default function EmploymentProfile({ token, user }: EmploymentProfileProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState<EmploymentData>({
    employment_status: "",
    company_name: "",
    position: "",
    start_date: "",
    salary_range: "",
    industry: "",
    is_related_to_studies: true
  });

  useEffect(() => {
    loadEmploymentProfile();
  }, []);

  const loadEmploymentProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFormData({
        employment_status: "empleado",
        company_name: "Tech Solutions SAC",
        position: "Desarrollador Full Stack",
        start_date: "2024-06-01",
        salary_range: "3000-5000",
        industry: "tecnologia",
        is_related_to_studies: true
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EmploymentData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: "¡Perfil laboral actualizado exitosamente!"
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil laboral...</p>
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
        <h2 className="text-2xl font-bold">Perfil Laboral</h2>
        <p className="text-muted-foreground">
          Mantén actualizada tu información laboral para ayudarnos a hacer seguimiento de tu desarrollo profesional
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="h-5 w-5 text-primary" />
              Situación Laboral Actual
            </CardTitle>
            <CardDescription>
              Comparte información sobre tu situación laboral actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employment_status">Estado Laboral *</Label>
              <Select
                value={formData.employment_status}
                onValueChange={(value) => handleChange("employment_status", value)}
              >
                <SelectTrigger id="employment_status">
                  <SelectValue placeholder="Selecciona tu situación laboral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empleado">Empleado</SelectItem>
                  <SelectItem value="independiente">Independiente / Freelance</SelectItem>
                  <SelectItem value="emprendedor">Emprendedor</SelectItem>
                  <SelectItem value="buscando">Buscando empleo</SelectItem>
                  <SelectItem value="estudiando">Estudiando</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.employment_status === "empleado" || formData.employment_status === "independiente") && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      <div className="flex items-center gap-2">
                        <IconBuilding className="h-4 w-4" />
                        Empresa / Organización
                      </div>
                    </Label>
                    <Input
                      id="company_name"
                      placeholder="Nombre de la empresa"
                      value={formData.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo / Puesto</Label>
                    <Input
                      id="position"
                      placeholder="Tu posición actual"
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4" />
                        Fecha de Inicio
                      </div>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_range">
                      <div className="flex items-center gap-2">
                        <IconCurrencyDollar className="h-4 w-4" />
                        Rango Salarial (S/)
                      </div>
                    </Label>
                    <Select
                      value={formData.salary_range}
                      onValueChange={(value) => handleChange("salary_range", value)}
                    >
                      <SelectTrigger id="salary_range">
                        <SelectValue placeholder="Selecciona un rango" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menos-1000">Menos de S/ 1,000</SelectItem>
                        <SelectItem value="1000-2000">S/ 1,000 - S/ 2,000</SelectItem>
                        <SelectItem value="2000-3000">S/ 2,000 - S/ 3,000</SelectItem>
                        <SelectItem value="3000-5000">S/ 3,000 - S/ 5,000</SelectItem>
                        <SelectItem value="5000-8000">S/ 5,000 - S/ 8,000</SelectItem>
                        <SelectItem value="mas-8000">Más de S/ 8,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industria / Sector</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleChange("industry", value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Selecciona una industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="finanzas">Finanzas</SelectItem>
                      <SelectItem value="retail">Retail / Comercio</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                      <SelectItem value="construccion">Construcción</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="gobierno">Gobierno</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_related">¿Tu trabajo está relacionado con tus estudios?</Label>
                  <Select
                    value={formData.is_related_to_studies ? "si" : "no"}
                    onValueChange={(value) => handleChange("is_related_to_studies", value === "si")}
                  >
                    <SelectTrigger id="is_related">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => loadEmploymentProfile()}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={saving || !formData.employment_status}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <IconBriefcase className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">¿Por qué es importante?</h4>
              <p className="text-sm text-muted-foreground">
                Esta información nos ayuda a evaluar la efectividad de nuestros programas de capacitación
                y a mejorar continuamente nuestros contenidos para que se ajusten mejor a las necesidades
                del mercado laboral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}