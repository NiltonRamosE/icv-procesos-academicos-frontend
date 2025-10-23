// ClassHeader.tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { type ClassData, type Material } from "@/dashboard/courses/class/types";
import { formatDate, formatTime, getStatusColor, getStatusLabel } from "@/dashboard/courses/class/utils";

interface ClassHeaderProps {
  classData: ClassData;
  mainImage: Material | null;
}

export const ClassHeader = ({ classData, mainImage }: ClassHeaderProps) => {
  return (
    <Card className="border-2 overflow-hidden">
      {/* Imagen principal a ancho completo */}
      {mainImage && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-primary/10 to-primary/5">
          <img 
            src={mainImage.material_url} 
            alt="Imagen de la clase"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badge flotante sobre la imagen */}
          <div className="absolute top-4 right-4">
            <Badge className={`${getStatusColor(classData.class_status)} text-sm px-4 py-1.5`}>
              {getStatusLabel(classData.class_status)}
            </Badge>
          </div>
        </div>
      )}

      {/* Contenido de la clase */}
      <CardHeader className="space-y-4 p-6 lg:p-8">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-3xl lg:text-4xl leading-tight">
              {classData.class_name}
            </CardTitle>
            {/* Badge cuando no hay imagen */}
            {!mainImage && (
              <Badge className={getStatusColor(classData.class_status)}>
                {getStatusLabel(classData.class_status)}
              </Badge>
            )}
          </div>

          {classData.description && (
            <CardDescription className="text-base lg:text-lg leading-relaxed">
              {classData.description}
            </CardDescription>
          )}
        </div>

        {/* Información de fecha/hora y botón de reunión */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Fecha</span>
                <span className="text-sm font-medium">{formatDate(classData.class_date)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Horario</span>
                <span className="text-sm font-medium">
                  {formatTime(classData.start_time)} - {formatTime(classData.end_time)}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de reunión virtual */}
          {classData.meeting_url && (
            <Button 
              asChild 
              size="lg" 
              className="gap-2 bg-green-600 hover:bg-green-700 md:min-w-[200px]"
            >
              <a
                href={classData.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="h-4 w-4" />
                Unirse a la Reunión
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};