import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Calendar, Award, AlertCircle, DollarSign, UserCheck } from 'lucide-react'

interface SectionCardsProps {
  data?: any;
  role?: string;
}

export function SectionCards({ data, role = 'student' }: SectionCardsProps) {
  interface CardItem {
    title: string;
    value: any;
    icon: any;
    color: string;
    change?: string;
  }

  const getCardsConfig = (): CardItem[] => {
    switch (role) {
      case 'admin':
        return [
          {
            title: "Estudiantes Activos",
            value: data?.stats?.active_students?.total || "0",
            change: data?.stats?.active_students?.change_percentage || "+0%",
            icon: Users,
            color: "text-blue-600"
          },
          {
            title: "Docentes",
            value: data?.stats?.teachers?.total || "0",
            change: data?.stats?.teachers?.change_percentage || "+0%",
            icon: UserCheck,
            color: "text-green-600"
          },
          {
            title: "Cursos Activos",
            value: data?.stats?.active_courses?.total || "0",
            change: data?.stats?.active_courses?.change_percentage || "+0%",
            icon: BookOpen,
            color: "text-purple-600"
          },
          {
            title: "Ingresos del Mes",
            value: `${data?.stats?.monthly_revenue?.currency || 'S/'} ${data?.stats?.monthly_revenue?.total?.toLocaleString() || "0"}`,
            change: data?.stats?.monthly_revenue?.change_percentage || "+0%",
            icon: DollarSign,
            color: "text-yellow-600"
          }
        ];
      case 'teacher':
      case 'instructor':
        return [
          {
            title: "Mis Grupos",
            value: data?.stats?.my_groups?.total || "0",
            icon: Users,
            color: "text-blue-600"
          },
          {
            title: "Total Estudiantes",
            value: data?.stats?.total_students?.total || "0",
            icon: UserCheck,
            color: "text-green-600"
          },
          {
            title: "Clases Pendientes",
            value: data?.stats?.pending_classes?.total || "0",
            icon: Calendar,
            color: "text-purple-600"
          },
          {
            title: "Evaluaciones por Revisar",
            value: data?.stats?.pending_evaluations?.total || "0",
            icon: Award,
            color: "text-yellow-600"
          }
        ];
      default:
        return [
          {
            title: "Cursos Activos",
            value: data?.stats?.active_courses?.total || "0",
            icon: BookOpen,
            color: "text-blue-600"
          },
          {
            title: "Asistencia",
            value: `${data?.stats?.attendance?.percentage || "0"}%`,
            icon: UserCheck,
            color: "text-green-600"
          },
          {
            title: "Promedio General",
            value: data?.stats?.average_grade?.value || "0.0",
            icon: Award,
            color: "text-purple-600"
          },
          {
            title: "Próximas Evaluaciones",
            value: data?.stats?.upcoming_evaluations?.total || "0",
            icon: AlertCircle,
            color: "text-yellow-600"
          }
        ];
    }
  };

  const cards = getCardsConfig();

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change && (
                  <p className="text-xs text-muted-foreground">
                    {card.change} desde el último mes
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
