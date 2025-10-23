import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DataTableProps {
  data?: any;
  role?: string;
}

export function DataTable({ data, role = 'student' }: DataTableProps) {
  const getTableConfig = () => {
    switch(role) {
      case 'admin':
        return {
          title: "Actividad Reciente",
          description: "Últimas acciones en el sistema",
          columns: ["Acción", "Usuario", "Fecha"],
          data: data?.recent_activity || []
        };
      
      case 'teacher':
      case 'instructor':
        return {
          title: "Próximas Clases",
          description: "Clases programadas",
          columns: ["Curso", "Grupo", "Fecha", "Hora", "Acción"],
          data: data?.upcoming_classes || []
        };
      
      case 'student':
      default:
        return {
          title: "Próximas Evaluaciones",
          description: "Evaluaciones pendientes",
          columns: ["Curso", "Tipo", "Fecha", "Ponderación", "Acción"],
          data: data?.upcoming_evaluations || []
        };
    }
  };

  const config = getTableConfig();

  const renderRow = (item: any, index: number) => {
    switch(role) {
      case 'admin':
        return (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.action}</TableCell>
            <TableCell>{item.user}</TableCell>
            <TableCell>{new Date(item.time).toLocaleString('es-PE')}</TableCell>
          </TableRow>
        );
      
      case 'teacher':
      case 'instructor':
        return (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.course}</TableCell>
            <TableCell>{item.group}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.time}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline">Ver Detalles</Button>
            </TableCell>
          </TableRow>
        );
      
      case 'student':
      default:
        return (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.course}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.weight}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline">Prepararse</Button>
            </TableCell>
          </TableRow>
        );
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {!config.data || config.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos disponibles
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((col, idx) => (
                    <TableHead key={idx}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.data.map((item: any, idx: number) => renderRow(item, idx))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}