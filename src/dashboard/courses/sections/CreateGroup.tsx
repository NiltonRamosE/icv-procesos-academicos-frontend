import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateGroup() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el grupo
    console.log("Creando grupo...");
  };

  return (
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
  );
}