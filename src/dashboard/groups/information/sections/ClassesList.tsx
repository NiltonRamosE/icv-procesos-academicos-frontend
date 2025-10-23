// src/dashboard/groups/information/sections/ClassesList.tsx
import { BookOpen, Calendar, Clock, ExternalLink } from "lucide-react";
import { type Class } from "@/dashboard/groups/information/types";

interface ClassesListProps {
  classes: Class[];
  groupId?: string | number;
}

export default function ClassesList({ classes, groupId }: ClassesListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleClassClick = (classId: number) => {
    const gId = groupId || new URLSearchParams(window.location.search).get('groupId') || '';
    window.location.href = `/academico/dashboard/courses/clase?classId=${classId}&groupId=${gId}`;
  };

  return (
    <div className="bg-[#111115] rounded-xl border border-[#848282]/20 shadow-xl overflow-hidden">
      <div className="bg-[#201a2f] px-6 py-5 border-b border-[#848282]/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Clases</h3>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
            {classes.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-[#848282]/10 max-h-96 overflow-y-auto">
        {classes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BookOpen className="w-12 h-12 text-[#848282] mx-auto mb-3 opacity-50" />
            <p className="text-[#848282] text-sm">
              No hay clases programadas aún
            </p>
          </div>
        ) : (
          classes.map((classItem) => (
            <div
              key={classItem.id}
              onClick={() => handleClassClick(classItem.id)}
              className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group cursor-pointer relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    {classItem.class_name}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  
                  {classItem.description && (
                    <p className="text-sm text-[#848282] line-clamp-2">
                      {classItem.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-[#848282]">
                      <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{formatDate(classItem.class_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#848282]">
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>
                        {classItem.start_time} - {classItem.end_time}
                      </span>
                    </div>
                  </div>

                  {classItem.class_status && (
                    <div className="pt-2">
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium border
                        ${classItem.class_status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                        ${classItem.class_status === 'IN_PROGRESS' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
                        ${classItem.class_status === 'COMPLETED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' : ''}
                        ${classItem.class_status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/30' : ''}
                      `}>
                        {classItem.class_status === 'SCHEDULED' && 'Programada'}
                        {classItem.class_status === 'IN_PROGRESS' && 'En Progreso'}
                        {classItem.class_status === 'COMPLETED' && 'Completada'}
                        {classItem.class_status === 'CANCELLED' && 'Cancelada'}
                        {!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(classItem.class_status) && classItem.class_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador visual de click */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}