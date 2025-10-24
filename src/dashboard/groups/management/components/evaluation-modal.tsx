// components/evaluation-modal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCalendar,
  IconLink,
  IconLoader,
  IconCheck
} from "@tabler/icons-react";
import { config } from "config";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEvaluationCreated: () => void;
  groupId: string;
  token: string | null;
  teacherId: number;
}

interface EvaluationFormData {
  group_id: string;
  title: string;
  description: string;
  external_url: string;
  evaluation_type: string;
  due_date: string;
  weight: string;
  teacher_creator_id: number;
}

export default function EvaluationModal({
  isOpen,
  onClose,
  onEvaluationCreated,
  groupId,
  token,
  teacherId
}: EvaluationModalProps) {
  const [formData, setFormData] = useState<EvaluationFormData>({
    group_id: groupId,
    title: "",
    description: "",
    external_url: "",
    evaluation_type: "",
    due_date: "",
    weight: "",
    teacher_creator_id: teacherId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const evaluationTypes = [
    { value: "Exam", label: "Examen" },
    { value: "Project", label: "Proyecto" },
    { value: "Quiz", label: "Quiz" },
    { value: "Assignment", label: "Tarea" }
  ];

  const handleInputChange = (field: keyof EvaluationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.evaluations.create}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight), // Convertir a número
          teacher_creator_id: teacherId // Asegurar que siempre use el teacherId correcto
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la evaluación");
      }

      const createdEvaluation = await response.json();
      console.log("Evaluación creada:", createdEvaluation);
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onEvaluationCreated();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error creando evaluación:", err);
      setError(err instanceof Error ? err.message : "Error al crear la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      group_id: groupId,
      title: "",
      description: "",
      external_url: "",
      evaluation_type: "",
      due_date: "",
      weight: "",
      teacher_creator_id: teacherId
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calcular fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Nueva Evaluación
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva evaluación para el grupo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Mensajes de estado */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-600" />
              <p className="text-green-700 text-sm">¡Evaluación creada exitosamente!</p>
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título de la evaluación *
            </Label>
            <Input
              id="title"
              placeholder="Ej: Examen Parcial - HTML/CSS"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Tipo de evaluación y Peso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evaluation_type" className="text-sm font-medium">
                Tipo de evaluación *
              </Label>
              <Select
                value={formData.evaluation_type}
                onValueChange={(value) => handleInputChange("evaluation_type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">
                Peso (puntos) *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej: 2.0"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-sm font-medium flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Fecha de vencimiento *
            </Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              min={getMinDate()}
              required
              disabled={loading}
            />
          </div>

          {/* Enlace externo */}
          <div className="space-y-2">
            <Label htmlFor="external_url" className="text-sm font-medium flex items-center gap-2">
              <IconLink className="h-4 w-4" />
              Enlace externo (opcional)
            </Label>
            <Input
              id="external_url"
              type="url"
              placeholder="https://ejemplo.com/evaluacion"
              value={formData.external_url}
              onChange={(e) => handleInputChange("external_url", e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              URL donde los estudiantes realizarán la evaluación
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe los objetivos y requisitos de la evaluación..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Información del grupo */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Información del grupo</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>ID del grupo: {groupId}</p>
              <p>Docente creador: ID {teacherId}</p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.evaluation_type || !formData.due_date || !formData.weight}
            >
              {loading ? (
                <>
                  <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Evaluación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}