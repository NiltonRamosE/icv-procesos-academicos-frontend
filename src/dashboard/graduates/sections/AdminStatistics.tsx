// Archivo: src/dashboard/graduates/sections/AdminStatistics.tsx
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
  IconLoader,
  IconFileTypePdf
} from "@tabler/icons-react";
import graduatesApi, { type StatisticsData } from "@/lib/api/graduatesApi";

interface AdminStatisticsProps {
  token: string | null;
}

export default function AdminStatistics({ token }: AdminStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadStatistics();
    }
  }, [token]);

  const loadStatistics = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await graduatesApi.statistics.get(token);
      console.log('✅ Estadísticas cargadas:', data);
      setStatistics(data);
    } catch (error: any) {
      console.error("❌ Error cargando estadísticas:", error);
      setError(error.message || "Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!statistics) return;

    setExporting(true);

    try {
      // Crear HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Empleabilidad</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              background: white;
              color: #1a1a1a;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 30px;
              text-align: center;
              margin-bottom: 30px;
              border-radius: 10px;
            }
            .header h1 { font-size: 28px; margin-bottom: 8px; }
            .header p { font-size: 14px; opacity: 0.9; }
            .metrics {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .metric-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .metric-card h3 {
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .metric-card p {
              color: #6b7280;
              font-size: 13px;
            }
            .metric-card.blue { border-color: #3b82f6; }
            .metric-card.blue h3 { color: #3b82f6; }
            .metric-card.green { border-color: #22c55e; }
            .metric-card.green h3 { color: #22c55e; }
            .metric-card.purple { border-color: #a855f7; }
            .metric-card.purple h3 { color: #a855f7; }
            .metric-card.orange { border-color: #f97316; }
            .metric-card.orange h3 { color: #f97316; }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 3px solid #3b82f6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #3b82f6;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .salary-info {
              background: #eff6ff;
              border: 2px solid #3b82f6;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .salary-info strong {
              color: #3b82f6;
              font-size: 18px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Reporte de Empleabilidad</h1>
            <p>Dashboard de Estadísticas de Egresados</p>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} a las ${new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="metrics">
            <div class="metric-card blue">
              <h3>${statistics.total_graduates || 0}</h3>
              <p>Total de Egresados</p>
            </div>
            <div class="metric-card green">
              <h3>${statistics.employed_count || 0}</h3>
              <p>Egresados Empleados</p>
            </div>
            <div class="metric-card purple">
              <h3>${statistics.employment_rate || 0}%</h3>
              <p>Tasa de Empleabilidad</p>
            </div>
            <div class="metric-card orange">
              <h3>${statistics.related_work_percentage || 0}%</h3>
              <p>Trabajo Relacionado con Estudios</p>
            </div>
          </div>

          <div class="salary-info">
            <p style="margin-bottom: 5px; color: #374151;">Rango Salarial Promedio</p>
            <strong>${statistics.average_salary_range || 'No disponible'}</strong>
          </div>

          ${statistics.employment_by_status && statistics.employment_by_status.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📈 Distribución por Estado Laboral</h2>
            <table>
              <thead>
                <tr>
                  <th>Estado Laboral</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: center;">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${statistics.employment_by_status.map(status => `
                  <tr>
                    <td><strong>${status.status}</strong></td>
                    <td style="text-align: center;">${status.count}</td>
                    <td style="text-align: center;">${status.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${statistics.top_industries && statistics.top_industries.length > 0 ? `
          <div class="section">
            <h2 class="section-title">🏢 Top 5 Industrias</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Industria</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: center;">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${statistics.top_industries.map((industry, index) => `
                  <tr>
                    <td style="font-weight: bold; color: #3b82f6;">${index + 1}</td>
                    <td><strong>${industry.name}</strong></td>
                    <td style="text-align: center;">${industry.count}</td>
                    <td style="text-align: center;">${industry.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p><strong>Sistema de Seguimiento de Egresados</strong></p>
            <p>Este reporte contiene información confidencial y está destinado únicamente para uso administrativo</p>
          </div>
        </body>
        </html>
      `;

      // Abrir ventana de impresión
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para descargar el PDF');
        setExporting(false);
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Esperar a que cargue y luego imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // La ventana se cierra automáticamente después de imprimir o cancelar
          setExporting(false);
        }, 250);
      };

      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, intenta nuevamente.");
      setExporting(false);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={loadStatistics}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Reintentar
        </button>
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
            <div className="text-3xl font-bold">{statistics.total_graduates || 0}</div>
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
            <div className="text-3xl font-bold">{statistics.employed_count || 0}</div>
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
              <div className="text-3xl font-bold">{statistics.employment_rate || 0}%</div>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Índice actual
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
            <div className="text-xl font-bold">{statistics.average_salary_range || 'N/A'}</div>
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
          {!statistics.employment_by_status || statistics.employment_by_status.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos de estados laborales disponibles
            </p>
          ) : (
            <div className="space-y-4">
              {statistics.employment_by_status.map((status, index) => (
                <div key={`status-${index}`} className="space-y-2">
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
          )}
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
            {!statistics.top_industries || statistics.top_industries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de industrias disponibles
              </p>
            ) : (
              <div className="space-y-4">
                {statistics.top_industries.map((industry, index) => (
                  <div key={`industry-${index}`} className="flex items-center gap-3">
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
            )}
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
                  {statistics.related_work_percentage || 0}%
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
                Descarga un reporte detallado en formato PDF con todas las estadísticas
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={generatePDF}
                disabled={exporting}
              >
                <IconFileTypePdf className="h-4 w-4" />
                {exporting ? "Generando PDF..." : "Descargar PDF"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}