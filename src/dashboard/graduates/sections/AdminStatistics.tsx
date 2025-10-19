import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IconUsers, 
  IconBriefcase, 
  IconTrendingUp, 
  IconPercentage,
  IconChartBar,
  IconBuilding,
  IconCurrencyDollar,
  IconLoader
} from "@tabler/icons-react";
import { config } from "config";

interface AdminStatisticsProps {
  token: string | null;
}

interface StatisticsData {
  total_graduates: number;
  employed_count: number;
  employment_rate: number;
  average_salary_range: string;
  top_industries: { name: string; count: number; percentage: number }[];
  employment_by_status: { status: string; count: number; percentage: number }[];
  related_work_percentage: number;
}

export default function AdminStatistics({ token }: AdminStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      // Simulación de datos - Reemplazar con llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStatistics({
        total_graduates: 245,
        employed_count: 198,
        employment_rate: 80.8,
        average_salary_range: "S/ 3,000 - S/ 5,000",
        related_work_percentage: 75.5,
        top_industries: [
          { name: "Tecnología", count: 89, percentage: 44.9 },
          { name: "Educación", count: 34, percentage: 17.2 },
          { name: "Finanzas", count: 28, percentage: 14.1 },
          { name: "Salud", count: 22, percentage: 11.1 },
          { name: "Otros", count: 25, percentage: 12.6 }
        ],
        employment_by_status: [
          { status: "Empleado", count: 165, percentage: 67.3 },
          { status: "Independiente", count: 33, percentage: 13.5 },
          { status: "Emprendedor", count: 12, percentage: 4.9 },
          { status: "Buscando empleo", count: 25, percentage: 10.2 },
          { status: "Estudiando", count: 10, percentage: 4.1 }
        ]
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconLoader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Estadísticas de Empleabilidad</h2>
        <p className="text-muted-foreground">
          Dashboard con indicadores clave de seguimiento de egresados
        </p>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              Total de Egresados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.total_graduates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Egresados registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconBriefcase className="h-4 w-4" />
              Empleados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.employed_count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Con empleo activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconPercentage className="h-4 w-4" />
              Tasa de Empleabilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{statistics.employment_rate}%</div>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                +5.2%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <IconCurrencyDollar className="h-4 w-4" />
              Rango Salarial Promedio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{statistics.average_salary_range}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mensual promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Estado Laboral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" />
            Distribución por Estado Laboral
          </CardTitle>
          <CardDescription>
            Situación laboral actual de los egresados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.employment_by_status.map((status, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{status.status}</span>
                  <span className="text-muted-foreground">
                    {status.count} ({status.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Industrias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-primary" />
              Top Industrias
            </CardTitle>
            <CardDescription>
              Sectores donde trabajan los egresados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.top_industries.map((industry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{industry.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {industry.count} ({industry.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${industry.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trabajo Relacionado con Estudios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-primary" />
              Relevancia Laboral
            </CardTitle>
            <CardDescription>
              Egresados trabajando en áreas relacionadas a sus estudios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {statistics.related_work_percentage}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Trabajan en áreas relacionadas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.round((statistics.related_work_percentage / 100) * statistics.employed_count)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trabajo relacionado
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-amber-500">
                    {statistics.employed_count - Math.round((statistics.related_work_percentage / 100) * statistics.employed_count)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trabajo no relacionado
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Nota:</span> Un alto porcentaje
                  indica que nuestros programas están alineados con las demandas del mercado laboral.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjeta de acciones */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="font-semibold mb-1">Exportar Reporte Completo</h4>
              <p className="text-sm text-muted-foreground">
                Descarga un reporte detallado con todas las estadísticas en formato PDF o Excel
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Descargar PDF
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Descargar Excel
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}