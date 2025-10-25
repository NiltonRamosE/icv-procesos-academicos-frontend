// Archivo: src/dashboard/graduates/sections/GraduateSurveys.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  IconClipboardCheck, 
  IconLoader, 
  IconAlertCircle, 
  IconCheck,
  IconClock,
  IconFileText,
  IconRefresh,
  IconEye
} from "@tabler/icons-react";
import graduatesApi, { type Survey } from "@/lib/api/graduatesApi";
import SurveyResponseDialog from "../components/SurveyResponseDialog";

interface GraduateSurveysProps {
  token: string | null;
  user: any;
}

export default function GraduateSurveys({ token, user }: GraduateSurveysProps) {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false); // ✅ NUEVO: Estado para el modo vista

  useEffect(() => {
    if (token) {
      loadSurveys();
    }
  }, [token]);

  const loadSurveys = async () => {
    if (!token) {
      setMessage({
        type: 'error',
        text: "No hay token de autenticación. Por favor, inicia sesión nuevamente."
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      console.log('🔍 Cargando encuestas con token:', token.substring(0, 30) + '...');
      const data = await graduatesApi.surveys.list(token);
      setSurveys(data);
      console.log('✅ Encuestas cargadas:', data);
    } catch (error: any) {
      console.error("❌ Error cargando encuestas:", error);
      
      if (error.message.includes("Sesión expirada") || error.message.includes("401")) {
        setMessage({
          type: 'error',
          text: "Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente."
        });
      } else {
        setMessage({
          type: 'error',
          text: error.message || "Error al cargar las encuestas"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACTUALIZADO: Ahora detecta si es para ver o responder
  const handleStartSurvey = (surveyId: number, isCompleted: boolean) => {
    console.log("🎯 Intentando abrir encuesta ID:", surveyId, "Completada:", isCompleted);
    const survey = surveys.find(s => s.id === surveyId);
    
    if (!survey) {
      console.error("❌ Encuesta no encontrada");
      setMessage({
        type: 'error',
        text: "No se pudo cargar la encuesta"
      });
      return;
    }

    console.log("✅ Encuesta encontrada:", survey);
    setSelectedSurvey(survey);
    setViewMode(isCompleted); // ✅ Si está completada, abrir en modo lectura
    setDialogOpen(true);
  };

  const handleSurveySuccess = () => {
    console.log("🎉 Encuesta completada exitosamente");
    setMessage({
      type: 'success',
      text: '¡Encuesta completada exitosamente! Gracias por tu participación.'
    });
    setTimeout(() => setMessage(null), 5000);
    loadSurveys();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconLoader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando encuestas...</p>
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

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Encuestas de Seguimiento</h2>
          <p className="text-muted-foreground">
            Completa las encuestas disponibles para ayudarnos a mejorar continuamente
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSurveys}
          className="gap-2"
        >
          <IconRefresh className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconFileText className="h-4 w-4" />
              Total de Encuestas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponibles para ti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Completadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {surveys.filter(s => s.completed).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Encuestas respondidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              Pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {surveys.filter(s => !s.completed).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por completar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de encuestas */}
      {surveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-muted rounded-full mb-4">
              <IconClipboardCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay encuestas disponibles</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Las nuevas encuestas aparecerán aquí cuando estén disponibles. 
              Mantente atento a las notificaciones.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Encuestas Disponibles</h3>
          
          {/* Encuestas pendientes */}
          {surveys.filter(s => !s.completed).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Pendientes de completar
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys
                  .filter(survey => !survey.completed)
                  .map((survey) => (
                    <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{survey.title}</CardTitle>
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                            Pendiente
                          </Badge>
                        </div>
                        <CardDescription>{survey.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IconFileText className="h-4 w-4" />
                            <span>{survey.questions?.length || 0} preguntas</span>
                          </div>
                        </div>
                        <Button
                          className="w-full gap-2"
                          onClick={() => {
                            console.log("🖱️ Click en botón Responder Encuesta");
                            handleStartSurvey(survey.id, false); // ✅ false = modo edición
                          }}
                        >
                          <IconClipboardCheck className="h-4 w-4" />
                          Responder Encuesta
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Encuestas completadas */}
          {surveys.filter(s => s.completed).length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Completadas
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys
                  .filter(survey => survey.completed)
                  .map((survey) => (
                    <Card key={survey.id} className="border-green-500/20 bg-green-500/5">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{survey.title}</CardTitle>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <IconCheck className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                        </div>
                        <CardDescription>{survey.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IconFileText className="h-4 w-4" />
                            <span>{survey.questions?.length || 0} preguntas</span>
                          </div>
                          {survey.completed_at && (
                            <div className="flex items-center gap-1">
                              <IconClock className="h-4 w-4" />
                              <span>
                                {new Date(survey.completed_at).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => handleStartSurvey(survey.id, true)} // ✅ true = modo lectura
                        >
                          <IconEye className="h-4 w-4" />
                          Ver Respuestas
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <IconClipboardCheck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">¿Por qué completar las encuestas?</h4>
              <p className="text-sm text-muted-foreground">
                Tus respuestas nos ayudan a entender mejor tu experiencia profesional y a mejorar
                nuestros programas de formación. Toda la información es confidencial y se utiliza
                únicamente con fines estadísticos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para responder/ver encuesta */}
      <SurveyResponseDialog
        survey={selectedSurvey}
        open={dialogOpen}
        onOpenChange={(open) => {
          console.log("📋 Estado del diálogo cambiado a:", open);
          setDialogOpen(open);
          if (!open) {
            setSelectedSurvey(null);
            setViewMode(false); // ✅ Resetear modo vista
          }
        }}
        token={token}
        onSuccess={handleSurveySuccess}
        viewMode={viewMode} // ✅ NUEVO: Pasar el modo vista
      />
    </div>
  );
}