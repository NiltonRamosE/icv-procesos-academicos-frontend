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
  IconClock 
} from "@tabler/icons-react";
import { config } from "config.ts";

interface EvaluationsTabProps {
  groupId: string;
  token: string | null;
  isTeacher: boolean;
}

interface Evaluation {
  id: number;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  duration_minutes?: number;
  total_score: number;
  description?: string;
  status?: string;
}

export default function EvaluationsTab({ groupId, token, isTeacher }: EvaluationsTabProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvaluations();
  }, [groupId]);

  const loadEvaluations = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.getEvaluations}`.replace(":id", groupId);

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
      setEvaluations(data.evaluations || data || []);
    } catch (err) {
      console.error("Error cargando evaluaciones:", err);
      setError(err instanceof Error ? err.message : "Error al cargar evaluaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = () => {
    // TODO: Implementar modal de creación de evaluación
    console.log("Crear nueva evaluación");
  };

  const getEvaluationType = (type: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      'exam': { label: 'Examen', variant: 'default' },
      'assignment': { label: 'Trabajo', variant: 'secondary' },
      'quiz': { label: 'Quiz', variant: 'outline' },
      'project': { label: 'Proyecto', variant: 'default' }
    };

    const typeInfo = typeMap[type.toLowerCase()] || { label: type, variant: 'outline' };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadEvaluations} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Evaluaciones</h2>
        {isTeacher && (
          <Button onClick={handleCreateEvaluation}>
            <IconPlus className="h-4 w-4 mr-2" />
            Crear Evaluación
          </Button>
        )}
      </div>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay evaluaciones disponibles
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle>{evaluation.title}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {getEvaluationType(evaluation.type)}
                    <Badge variant="secondary">{evaluation.total_score} puntos</Badge>
                    {evaluation.duration_minutes && (
                      <Badge variant="secondary">
                        <IconClock className="h-3 w-3 mr-1" />
                        {evaluation.duration_minutes} min
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {evaluation.description && (
                  <p className="text-sm text-muted-foreground mb-3">{evaluation.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <IconCalendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Inicio</p>
                      <p>{new Date(evaluation.start_date).toLocaleString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <IconCalendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Fin</p>
                      <p>{new Date(evaluation.end_date).toLocaleString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}