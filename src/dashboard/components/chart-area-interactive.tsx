import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface ChartAreaInteractiveProps {
  data?: any;
  role?: string;
}

export function ChartAreaInteractive({ data, role = 'student' }: ChartAreaInteractiveProps) {
  const getChartConfig = () => {
    switch(role) {
      case 'admin':
        return {
          title: "Tendencia de Matrículas e Ingresos",
          description: "Últimos 6 meses",
          data: data?.enrollment_trend || [],
          type: "line",
          dataKeys: [
            { key: "enrollments", color: "hsl(var(--chart-1))", label: "Matrículas" },
            { key: "revenue", color: "hsl(var(--chart-2))", label: "Ingresos" }
          ]
        };
      
      case 'teacher':
      case 'instructor':
        return {
          title: "Estudiantes por Grupo",
          description: "Distribución actual",
          data: data?.students_per_group || [],
          type: "bar",
          dataKeys: [
            { key: "students", color: "hsl(var(--chart-1))", label: "Estudiantes" },
            { key: "attendance", color: "hsl(var(--chart-2))", label: "Asistencia %" }
          ]
        };
      
      case 'student':
      default:
        return {
          title: "Tendencia de Notas",
          description: "Últimas evaluaciones",
          data: data?.grades_trend || [],
          type: "line",
          dataKeys: [
            { key: "grade", color: "hsl(var(--chart-1))", label: "Calificación" }
          ]
        };
    }
  };

  const config = getChartConfig();

  const renderChart = () => {
    if (!config.data || config.data.length === 0) {
      return (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </div>
      );
    }

    const chartConfig: any = {};
    config.dataKeys.forEach((dk: any) => {
      chartConfig[dk.key] = {
        label: dk.label,
        color: dk.color,
      };
    });

    if (config.type === "bar") {
      return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={Object.keys(config.data[0])[0]} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {config.dataKeys.map((dk: any) => (
              <Bar key={dk.key} dataKey={dk.key} fill={dk.color} />
            ))}
          </BarChart>
        </ChartContainer>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={config.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={Object.keys(config.data[0])[0]} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          {config.dataKeys.map((dk: any) => (
            <Line 
              key={dk.key} 
              type="monotone" 
              dataKey={dk.key} 
              stroke={dk.color} 
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ChartContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}