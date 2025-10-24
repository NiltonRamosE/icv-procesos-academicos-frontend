// components/announcement-modal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconLink,
  IconLoader,
  IconCheck,
  IconEye
} from "@tabler/icons-react";
import { config } from "config";
import CloudinaryUploader from "@/services/CloudinaryUploader"; // Asegúrate de tener este componente

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementCreated: () => void;
  groupId: string;
  token: string | null;
  teacherId: number;
}

interface AnnouncementFormData {
  id_announcement?: number;
  title: string;
  content: string;
  image_url: string;
  display_type: string;
  target_page: string;
  link_url: string;
  button_text: string;
  status: string;
  start_date: string;
  end_date: string;
  created_by: number;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  onAnnouncementCreated,
  groupId,
  token,
  teacherId
}: AnnouncementModalProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    image_url: "",
    display_type: "info",
    target_page: "course",
    link_url: "",
    button_text: "",
    status: "draft",
    start_date: "",
    end_date: "",
    created_by: teacherId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const displayTypes = [
    { value: "banner", label: "Banner", description: "Anuncio destacado con imagen" },
    { value: "alert", label: "Alerta", description: "Para recordatorios importantes" },
    { value: "info", label: "Informativo", description: "Anuncio general de información" },
    { value: "schedule", label: "Horario", description: "Información de fechas y horarios" }
  ];

  const targetPages = [
    { value: "course", label: "Página del Curso" },
    { value: "evaluations", label: "Evaluaciones" },
    { value: "materials", label: "Materiales" },
    { value: "calendar", label: "Calendario" },
    { value: "announcements", label: "Anuncios" }
  ];

  const statusTypes = [
    { value: "draft", label: "Borrador" },
    { value: "published", label: "Publicado" },
    { value: "scheduled", label: "Programado" }
  ];

  const handleInputChange = (field: keyof AnnouncementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      // Generar un ID de anuncio único (en producción esto lo haría el backend)
      const announcementData = {
        ...formData,
        id_announcement: Math.floor(1000 + Math.random() * 9000), // ID temporal
        created_by: teacherId
      };

      // TODO: Reemplazar con el endpoint real cuando esté disponible
      console.log("Datos del anuncio a crear:", announcementData);
      
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, descomentar esto:
      // const response = await fetch(`${config.apiUrl}/api/announcements`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${tokenWithoutQuotes}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(announcementData)
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Error al crear el anuncio");
      // }

      // const createdAnnouncement = await response.json();
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onAnnouncementCreated();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error creando anuncio:", err);
      setError(err instanceof Error ? err.message : "Error al crear el anuncio");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image_url: "",
      display_type: "info",
      target_page: "course",
      link_url: "",
      button_text: "",
      status: "draft",
      start_date: "",
      end_date: "",
      created_by: teacherId
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDisplayTypeBadge = (displayType: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "outline"; color: string }> = {
      'banner': { label: 'Banner', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'alert': { label: 'Alerta', variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'info': { label: 'Informativo', variant: 'outline', color: 'bg-green-100 text-green-800' },
      'schedule': { label: 'Horario', variant: 'outline', color: 'bg-purple-100 text-purple-800' }
    };

    const typeInfo = typeMap[displayType] || { label: displayType, variant: 'outline', color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant={typeInfo.variant} className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Nuevo Anuncio
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo anuncio para el grupo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Mensajes de estado */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-600" />
              <p className="text-green-700 text-sm">¡Anuncio creado exitosamente!</p>
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título del anuncio *
            </Label>
            <Input
              id="title"
              placeholder="Ej: Recordatorio de Examen Parcial"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Tipo de visualización y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_type" className="text-sm font-medium">
                Tipo de visualización *
              </Label>
              <Select
                value={formData.display_type}
                onValueChange={(value) => handleInputChange("display_type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {displayTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {type.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Estado *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Página destino */}
          <div className="space-y-2">
            <Label htmlFor="target_page" className="text-sm font-medium">
              Página destino
            </Label>
            <Select
              value={formData.target_page}
              onValueChange={(value) => handleInputChange("target_page", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una página" />
              </SelectTrigger>
              <SelectContent>
                {targetPages.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas de vigencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Fecha de inicio
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                min={getMinDate()}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Fecha de fin
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                min={formData.start_date || getMinDate()}
                disabled={loading}
              />
            </div>
          </div>

          {/* Imagen del anuncio */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <IconCheck className="h-4 w-4" />
              Imagen del anuncio (opcional)
            </Label>
            
            {formData.image_url ? (
              <div className="space-y-2">
                <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border">
                  <img
                    src={formData.image_url}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <IconEye className="h-3 w-3" />
                      Vista previa
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("image_url", "")}
                  disabled={loading}
                >
                  Cambiar imagen
                </Button>
              </div>
            ) : (
              <CloudinaryUploader
                onUpload={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: url,
                  }))
                }
                acceptType="image"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Recomendado para anuncios tipo Banner. Tamaño sugerido: 1200x600px
            </p>
          </div>

          {/* Enlace y texto del botón */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link_url" className="text-sm font-medium flex items-center gap-2">
                <IconLink className="h-4 w-4" />
                Enlace de acción
              </Label>
              <Input
                id="link_url"
                type="url"
                placeholder="https://ejemplo.com/destino"
                value={formData.link_url}
                onChange={(e) => handleInputChange("link_url", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_text" className="text-sm font-medium">
                Texto del botón
              </Label>
              <Input
                id="button_text"
                placeholder="Ej: Ver más información"
                value={formData.button_text}
                onChange={(e) => handleInputChange("button_text", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Contenido del anuncio *
            </Label>
            <Textarea
              id="content"
              placeholder="Escribe el contenido completo del anuncio aquí..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={6}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Puedes usar saltos de línea para formatear el texto. Los anuncios soportan formato básico.
            </p>
          </div>

          {/* Vista previa del tipo */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <IconEye className="h-4 w-4" />
              Vista previa del tipo
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Este anuncio se mostrará como:</span>
              {getDisplayTypeBadge(formData.display_type)}
            </div>
          </div>

          {/* Información del grupo */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2 text-blue-800">Información del grupo</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>ID del grupo: {groupId}</p>
              <p>Docente creador: ID {teacherId}</p>
              <p>Tipo seleccionado: {displayTypes.find(t => t.value === formData.display_type)?.label}</p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
            >
              {loading ? (
                <>
                  <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Anuncio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}