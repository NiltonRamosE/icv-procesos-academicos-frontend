// Archivo: src/dashboard/graduates/sections/GraduateSurveys.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { IconCheck, IconAlertCircle, IconClipboardCheck, IconSend } from "@tabler/icons-react";

interface GraduateSurveysProps {
  token: string | null;
  user: any;
}

interface Survey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  completed: boolean;
}

interface SurveyQuestion {
  id: number;
  question: string;
  type: "text" | "rating" | "multiple_choice";
  options?: string[];
}

export default function GraduateSurveys({ token, user }: GraduateSurveysProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSurveys([
        {
          id: 1,
          title: "Encuesta de Satisfacción del Programa",
          description: "Ayúdanos a mejorar compartiendo tu experiencia en el programa de capacitación",
          completed: false,
          questions: [
            {
              id: 1,
              question: "¿Cómo calificarías la calidad general del programa?",
              type: "rating"
            },
            {
              id: 2,
              question: "¿Los contenidos del curso fueron relevantes para tu desarrollo profesional?",
              type: "text"
            },
            {
              id: 3,
              question: "¿Recomendarías este programa a otros profesionales?",
              type: "multiple_choice",
              options: ["Definitivamente sí", "Probablemente sí", "No estoy seguro", "Probablemente no", "Definitivamente no"]
            },
            {
              id: 4,
              question: "¿Qué aspectos del programa te parecieron más valiosos?",
              type: "text"
            }
          ]
        }
      ]);
    } catch (error) {
      console.error("Error cargando encuestas:", error);
      setMessage({
        type: 'error',
        text: "Error al cargar las encuestas"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitSurvey = async () => {
    if (!selectedSurvey) return;

    const allAnswered = selectedSurvey.questions.every(q => answers[q.id]);
    if (!allAnswered) {
      setMessage({
        type: 'error',
        text: "Por favor, responde todas las preguntas antes de enviar"
      });
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: "¡Encuesta enviada exitosamente! Gracias por tu feedback."
      });

      setSurveys(prev => prev.map(s => 
        s.id === selectedSurvey.id ? { ...s, completed: true } : s
      ));
      
      setSelectedSurvey(null);
      setAnswers({});
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error enviando encuesta:", error);
      setMessage({
        type: 'error',
        text: "Error al enviar la encuesta. Por favor, intenta nuevamente."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!selectedSurvey) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / selectedSurvey.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  if (!selectedSurvey) {
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
          <h2 className="text-2xl font-bold">Encuestas Disponibles</h2>
          <p className="text-muted-foreground">
            Completa las encuestas para ayudarnos a mejorar nuestros programas
          </p>
        </div>

        <div className="grid gap-4">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <IconClipboardCheck className="h-5 w-5 text-primary" />
                      {survey.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {survey.description}
                    </CardDescription>
                  </div>
                  {survey.completed && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/20">
                      <IconCheck className="h-4 w-4" />
                      Completada
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {survey.questions.length} preguntas
                  </div>
                  <Button
                    onClick={() => setSelectedSurvey(survey)}
                    disabled={survey.completed}
                    variant={survey.completed ? "outline" : "default"}
                  >
                    {survey.completed ? "Ver Respuestas" : "Comenzar Encuesta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedSurvey(null);
            setAnswers({});
            setMessage(null);
          }}
        >
          ← Volver a encuestas
        </Button>
        <div className="text-sm text-muted-foreground">
          {Object.keys(answers).length} de {selectedSurvey.questions.length} preguntas respondidas
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedSurvey.title}</CardTitle>
          <CardDescription>{selectedSurvey.description}</CardDescription>
          <div className="pt-4">
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedSurvey.questions.map((question, index) => (
            <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
              <Label className="text-base font-semibold">
                {index + 1}. {question.question}
              </Label>
              
              {question.type === "text" && (
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="min-h-[100px]"
                />
              )}
              
              {question.type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={answers[question.id] === String(rating) ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, String(rating))}
                      className="flex-1"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              )}
              
              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <Button
                      key={option}
                      variant={answers[question.id] === option ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, option)}
                      className="w-full justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedSurvey(null);
                setAnswers({});
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmitSurvey}
              disabled={submitting || Object.keys(answers).length !== selectedSurvey.questions.length}
            >
              <IconSend className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar Encuesta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}