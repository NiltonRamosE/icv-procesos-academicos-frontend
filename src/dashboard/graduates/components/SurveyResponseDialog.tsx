// Archivo: src/dashboard/graduates/components/SurveyResponseDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconLoader, IconCheck, IconAlertCircle, IconEye } from "@tabler/icons-react";
import graduatesApi, { type Survey, type SurveyQuestion } from "@/lib/api/graduatesApi";

interface SurveyResponseDialogProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  onSuccess: () => void;
  viewMode?: boolean; // ✅ NUEVO: Modo solo lectura
}

export default function SurveyResponseDialog({
  survey,
  open,
  onOpenChange,
  token,
  onSuccess,
  viewMode = false // ✅ Por defecto en modo edición
}: SurveyResponseDialogProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Cargar respuestas guardadas si estamos en modo lectura
  useEffect(() => {
    if (open && viewMode && survey && token) {
      loadSavedResponses();
    } else if (!open) {
      setAnswers({});
      setError(null);
    }
  }, [open, viewMode, survey?.id]);

  const loadSavedResponses = async () => {
    if (!survey || !token) return;

    setLoading(true);
    try {
      console.log('📖 Cargando respuestas guardadas...');
      const response = await graduatesApi.surveys.getResponse(token, survey.id);
      console.log('✅ Respuestas cargadas:', response);
      setAnswers(response);
    } catch (err: any) {
      console.error('❌ Error cargando respuestas:', err);
      setError('No se pudieron cargar las respuestas guardadas');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    if (viewMode) return; // ✅ No permitir edición en modo lectura
    
    console.log(`Respuesta actualizada - Pregunta ${questionId}:`, value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!survey || !token || viewMode) {
      console.error("No hay survey, token o está en modo lectura");
      return;
    }

    console.log("📝 Intentando enviar respuestas:", answers);

    // Validar que todas las preguntas tengan respuesta
    const unansweredQuestions = survey.questions.filter(
      q => !answers[q.id] || answers[q.id].trim() === ''
    );
    
    if (unansweredQuestions.length > 0) {
      setError(`Por favor, responde todas las preguntas. Faltan ${unansweredQuestions.length} pregunta(s).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log("🚀 Enviando respuestas al servidor...");
      await graduatesApi.surveys.submitResponse(token, survey.id, answers);
      
      console.log("✅ Respuestas enviadas exitosamente");
      
      setAnswers({});
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error("❌ Error enviando respuestas:", err);
      setError(err.message || "Error al enviar las respuestas. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={`q-${question.id}`}>
              {question.question}
              {!viewMode && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={`q-${question.id}`}
              placeholder={viewMode ? "Sin respuesta" : "Escribe tu respuesta aquí..."}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={3}
              className="resize-none"
              disabled={viewMode} // ✅ Deshabilitar en modo lectura
              readOnly={viewMode}
            />
          </div>
        );

      case "rating":
        return (
          <div className="space-y-3">
            <Label>
              {question.question}
              {!viewMode && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    if (!viewMode) {
                      console.log(`Rating seleccionado: ${rating}`);
                      handleAnswerChange(question.id, rating.toString());
                    }
                  }}
                  disabled={viewMode} // ✅ Deshabilitar en modo lectura
                  className={`
                    flex-1 h-12 rounded-lg border-2 font-semibold transition-all
                    ${answers[question.id] === rating.toString()
                      ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                      : 'border-input hover:border-primary/50 hover:bg-accent'
                    }
                    ${viewMode ? 'cursor-default opacity-70' : 'cursor-pointer'}
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Muy insatisfecho</span>
              <span>Muy satisfecho</span>
            </div>
          </div>
        );

      case "multiple_choice":
        return (
          <div className="space-y-3">
            <Label>
              {question.question}
              {!viewMode && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (!viewMode) {
                      console.log(`Opción seleccionada: ${option}`);
                      handleAnswerChange(question.id, option);
                    }
                  }}
                  disabled={viewMode} // ✅ Deshabilitar en modo lectura
                  className={`
                    w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                    ${answers[question.id] === option
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-input hover:border-primary/50 hover:bg-accent'
                    }
                    ${viewMode ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${answers[question.id] === option
                        ? 'border-primary bg-primary'
                        : 'border-input'
                      }
                    `}>
                      {answers[question.id] === option && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground">
            Tipo de pregunta no soportado: {question.type}
          </div>
        );
    }
  };

  if (!survey) return null;

  const progress = (Object.keys(answers).length / survey.questions.length) * 100;
  const allAnswered = Object.keys(answers).length === survey.questions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{survey.title}</DialogTitle>
              <DialogDescription>{survey.description}</DialogDescription>
            </div>
            {viewMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                <IconEye className="h-4 w-4" />
                Solo lectura
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <IconLoader className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Cargando respuestas...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de progreso - Solo en modo edición */}
            {!viewMode && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progreso: {Object.keys(answers).length} de {survey.questions.length} preguntas
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Badge de completado - Solo en modo lectura */}
            {viewMode && survey.completed_at && (
              <Alert className="bg-green-500/5 border-green-500/20">
                <IconCheck className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Completada el {new Date(survey.completed_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preguntas */}
            <div className="space-y-6 py-4">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      viewMode ? 'bg-blue-500/10' : 'bg-primary/10'
                    }`}>
                      <span className={`text-sm font-bold ${
                        viewMode ? 'text-blue-500' : 'text-primary'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          {viewMode ? (
            <Button
              onClick={() => onOpenChange(false)}
              className="gap-2 w-full"
            >
              <IconCheck className="h-4 w-4" />
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("Cancelando encuesta...");
                  onOpenChange(false);
                }}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="gap-2 w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4" />
                    Enviar Respuestas ({Object.keys(answers).length}/{survey.questions.length})
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}