// components/student-grades-modal.tsx
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconLoader,
  IconCheck,
  IconEdit,
  IconUser,
  IconChartBar,
  IconSchool
} from "@tabler/icons-react";
import { config } from "config";

interface StudentGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGradesUpdated: () => void;
  student: {
    id: number;
    name: string;
    evaluations: {
      evaluation_id: number;
      evaluation_title: string;
      evaluation_type: string;
      weight: string;
      obtained_grade: string | null;
      feedback: string | null;
      record_date: string | null;
    }[];
    average_grade?: number;
  };
  evaluations: any[];
  token: string | null;
  isTeacher: boolean;
}

interface GradeFormData {
  [evaluationId: number]: {
    obtained_grade: string;
    feedback: string;
  };
}

export default function StudentGradesModal({
  isOpen,
  onClose,
  onGradesUpdated,
  student,
  evaluations,
  token,
  isTeacher
}: StudentGradesModalProps) {
  const [formData, setFormData] = useState<GradeFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<number | null>(null);

  // Inicializar formData con los datos actuales del estudiante
  React.useEffect(() => {
    const initialFormData: GradeFormData = {};
    student.evaluations.forEach(evaluation => {
      initialFormData[evaluation.evaluation_id] = {
        obtained_grade: evaluation.obtained_grade || "",
        feedback: evaluation.feedback || ""
      };
    });
    setFormData(initialFormData);
  }, [student]);

  const handleInputChange = (evaluationId: number, field: 'obtained_grade' | 'feedback', value: string) => {
    setFormData(prev => ({
      ...prev,
      [evaluationId]: {
        ...prev[evaluationId],
        [field]: value
      }
    }));
    if (error) setError(null);
  };

  const handleSaveGrade = async (evaluationId: number) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const gradeData = formData[evaluationId];
      
      if (!gradeData.obtained_grade) {
        throw new Error("La calificación es requerida");
      }

      const gradeValue = parseFloat(gradeData.obtained_grade);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20) {
        throw new Error("La calificación debe ser un número entre 0 y 20");
      }

      // Buscar si ya existe un registro de calificación para esta evaluación y estudiante
      const existingEvaluation = student.evaluations.find(
        evalItem => evalItem.evaluation_id === evaluationId
      );

      let response;
      
      if (existingEvaluation?.obtained_grade) {
        // UPDATE - Buscar el grade_record_id (necesitarías tener este dato)
        // Por ahora, usaremos create si no tenemos el ID específico
        response = await fetch(`${config.apiUrl}${config.endpoints.grades.create}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            evaluation_id: evaluationId,
            student_id: student.id,
            obtained_grade: gradeValue,
            feedback: gradeData.feedback || null
          })
        });
      } else {
        // CREATE
        response = await fetch(`${config.apiUrl}${config.endpoints.grades.create}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            evaluation_id: evaluationId,
            student_id: student.id,
            obtained_grade: gradeValue,
            feedback: gradeData.feedback || null
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la calificación");
      }

      setEditingEvaluation(null);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onGradesUpdated();
      }, 1500);

    } catch (err) {
      console.error("Error guardando calificación:", err);
      setError(err instanceof Error ? err.message : "Error al guardar la calificación");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "bg-gray-100 text-gray-800";
    if (grade >= 16) return "bg-green-100 text-green-800";
    if (grade >= 13) return "bg-blue-100 text-blue-800";
    if (grade >= 11) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getEvaluationTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      'Exam': { label: 'Examen', variant: 'default' },
      'Project': { label: 'Proyecto', variant: 'secondary' },
      'Quiz': { label: 'Quiz', variant: 'outline' },
      'Assignment': { label: 'Tarea', variant: 'outline' }
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const calculateAverage = () => {
    const grades = student.evaluations
      .filter(evalItem => evalItem.obtained_grade !== null)
      .map(evalItem => parseFloat(evalItem.obtained_grade!));

    if (grades.length === 0) return null;
    
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return parseFloat((sum / grades.length).toFixed(2));
  };

  const handleClose = () => {
    setEditingEvaluation(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <IconUser className="h-6 w-6" />
            Calificaciones de {student.name}
          </DialogTitle>
          <DialogDescription>
            {isTeacher ? "Ver y editar calificaciones del estudiante" : "Ver tus calificaciones"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mensajes de estado */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-600" />
              <p className="text-green-700 text-sm">¡Calificación guardada exitosamente!</p>
            </div>
          )}

          {/* Información del estudiante */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">Promedio General</p>
                  <div className="flex items-center gap-2">
                    <IconChartBar className="h-4 w-4 text-primary" />
                    <Badge className={`${getGradeColor(calculateAverage())} text-lg font-bold`}>
                      {calculateAverage() || "N/A"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Evaluaciones Completadas</p>
                  <div className="flex items-center gap-2">
                    <IconSchool className="h-4 w-4 text-primary" />
                    <span>
                      {student.evaluations.filter(e => e.obtained_grade !== null).length} / {student.evaluations.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de evaluaciones y calificaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Evaluaciones</h3>
            {student.evaluations.map((evaluation) => (
              <Card key={evaluation.evaluation_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{evaluation.evaluation_title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        {getEvaluationTypeBadge(evaluation.evaluation_type)}
                        <Badge variant="outline">{evaluation.weight} pts</Badge>
                      </div>
                    </div>
                    {evaluation.obtained_grade && !editingEvaluation && (
                      <Badge className={`${getGradeColor(parseFloat(evaluation.obtained_grade))} font-semibold`}>
                        {evaluation.obtained_grade}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {editingEvaluation === evaluation.evaluation_id ? (
                    // Modo edición
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`grade-${evaluation.evaluation_id}`} className="text-sm">
                            Calificación (0-20)
                          </Label>
                          <Input
                            id={`grade-${evaluation.evaluation_id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            placeholder="Ej: 15.5"
                            value={formData[evaluation.evaluation_id]?.obtained_grade || ""}
                            onChange={(e) => handleInputChange(evaluation.evaluation_id, 'obtained_grade', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`feedback-${evaluation.evaluation_id}`} className="text-sm">
                            Comentario
                          </Label>
                          <Input
                            id={`feedback-${evaluation.evaluation_id}`}
                            placeholder="Comentario opcional"
                            value={formData[evaluation.evaluation_id]?.feedback || ""}
                            onChange={(e) => handleInputChange(evaluation.evaluation_id, 'feedback', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveGrade(evaluation.evaluation_id)}
                          disabled={loading || !formData[evaluation.evaluation_id]?.obtained_grade}
                        >
                          {loading ? (
                            <IconLoader className="h-4 w-4 animate-spin" />
                          ) : (
                            "Guardar"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEvaluation(null)}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {evaluation.obtained_grade ? "Calificación asignada" : "Sin calificar"}
                        </span>
                        {isTeacher && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingEvaluation(evaluation.evaluation_id)}
                          >
                            <IconEdit className="h-4 w-4 mr-1" />
                            {evaluation.obtained_grade ? "Editar" : "Agregar"}
                          </Button>
                        )}
                      </div>
                      {evaluation.feedback && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          <strong>Comentario:</strong> {evaluation.feedback}
                        </div>
                      )}
                      {evaluation.record_date && (
                        <div className="text-xs text-muted-foreground">
                          Registrado: {new Date(evaluation.record_date).toLocaleDateString('es-PE')}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}