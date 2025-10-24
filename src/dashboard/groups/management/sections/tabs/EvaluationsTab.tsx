// components/evaluations-tab.tsx (versión actualizada)
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IconPlus, 
  IconLoader, 
  IconCalendar, 
  IconClock,
  IconExternalLink,
  IconUser,
  IconWeight
} from "@tabler/icons-react";
import { config } from "config";
import EvaluationModal from "@/dashboard/groups/management/components/evaluation-modal";

interface EvaluationsTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
  teacherId: number;
}

interface Evaluation {
  id: number;
  group_id: number;
  title: string;
  description: string;
  external_url: string;
  evaluation_type: string;
  due_date: string;
  weight: string;
  teacher_creator_id: number;
  created_at: string;
  updated_at: string;
  teacher_creator: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    profile_photo: string | null;
  };
}

export default function EvaluationsTab({ groupId, token, isTeacher, teacherId }: EvaluationsTabProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, [groupId]);

  const loadEvaluations = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.evaluations.getByGroup}`.replace(":groupId", groupId);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar evaluaciones: ${response.status}`);
      }

      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      console.error("Error cargando evaluaciones:", err);
      setError(err instanceof Error ? err.message : "Error al cargar evaluaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = () => {
    setIsModalOpen(true);
  };

  const handleEvaluationCreated = () => {
    // Recargar la lista de evaluaciones después de crear una nueva
    loadEvaluations();
  };

  // ... (resto de las funciones helper permanecen igual)
  const getEvaluationType = (type: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline"; color: string }> = {
      'Exam': { 
        label: 'Examen', 
        variant: 'default',
        color: 'bg-red-100 text-red-800 border-red-200'
      },
      'Project': { 
        label: 'Proyecto', 
        variant: 'secondary',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      'Quiz': { 
        label: 'Quiz', 
        variant: 'outline',
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      'Assignment': { 
        label: 'Tarea', 
        variant: 'outline',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'outline', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <Badge variant={typeInfo.variant} className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  const getWeightBadge = (weight: string) => {
    const weightValue = parseFloat(weight);
    let variant: "default" | "secondary" | "outline" = "outline";
    
    if (weightValue >= 2) variant = "default";
    else if (weightValue >= 1) variant = "secondary";
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <IconWeight className="h-3 w-3" />
        {weight} pts
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (diffDays === 0) {
      return <Badge variant="secondary">Vence hoy</Badge>;
    } else if (diffDays === 1) {
      return <Badge variant="secondary">Vence en 1 día</Badge>;
    } else if (diffDays <= 7) {
      return <Badge variant="secondary">Vence en {diffDays} días</Badge>;
    } else {
      return <Badge variant="outline">Vence en {diffDays} días</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Evaluaciones</h2>
            <p className="text-muted-foreground mt-1">
              {evaluations.length} {evaluations.length === 1 ? 'evaluación' : 'evaluaciones'} en total
            </p>
          </div>
          {isTeacher && (
            <Button onClick={handleCreateEvaluation}>
              <IconPlus className="h-4 w-4 mr-2" />
              Crear Evaluación
            </Button>
          )}
        </div>

        {/* ... (resto del JSX permanece igual) */}
        {evaluations.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <IconCalendar className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-muted-foreground">No hay evaluaciones</h3>
                  <p className="text-muted-foreground mt-2">
                    {isTeacher 
                      ? "Comienza creando la primera evaluación del grupo" 
                      : "Aún no hay evaluaciones programadas para este grupo"
                    }
                  </p>
                </div>
                {isTeacher && (
                  <Button onClick={handleCreateEvaluation} className="mt-4">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Crear Primera Evaluación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-xl">{evaluation.title}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          {getEvaluationType(evaluation.evaluation_type)}
                          {getWeightBadge(evaluation.weight)}
                        </div>
                      </div>
                      
                      {evaluation.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {evaluation.description}
                        </p>
                      )}

                      {/* Información del creador */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconUser className="h-4 w-4" />
                        <span>Creado por: {evaluation.teacher_creator.full_name}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fechas y estado */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconCalendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Fecha de vencimiento</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(evaluation.due_date)}
                          </p>
                          <div className="mt-2">
                            {getTimeRemaining(evaluation.due_date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconClock className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Creado</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(evaluation.created_at).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones y enlace externo */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IconExternalLink className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Enlace de evaluación</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            Accede a la plataforma externa para realizar la evaluación
                          </p>
                          <Button 
                            asChild 
                            variant="default" 
                            className="w-full sm:w-auto"
                          >
                            <a 
                              href={evaluation.external_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <IconExternalLink className="h-4 w-4" />
                              Ir a la evaluación
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear evaluación */}
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEvaluationCreated={handleEvaluationCreated}
        groupId={groupId}
        token={token}
        teacherId={teacherId}
      />
    </>
  );
}