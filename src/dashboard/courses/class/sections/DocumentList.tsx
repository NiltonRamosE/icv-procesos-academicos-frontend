// DocumentList.tsx
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { type Material } from "@/dashboard/courses/class/types";
import { getTypeIcon, getFileName } from "@/dashboard/courses/class/utils";

interface DocumentListProps {
  materials: Material[];
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const DocumentList = ({ 
  materials, 
  type, 
  label, 
  icon: Icon, 
  color 
}: DocumentListProps) => {
  const filtered = materials.filter(m => m.type.toUpperCase() === type.toUpperCase());
  
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold text-lg">{label}</h3>
        <Badge variant="outline">{filtered.length}</Badge>
      </div>
      
      {/* Una sola columna para cada tipo de documento */}
      <div className="space-y-2">
        {filtered.map((material) => (
          <a
            key={material.id}
            href={material.material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 bg-muted rounded-lg flex-shrink-0">
              {getTypeIcon(material.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {getFileName(material.material_url)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(material.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};