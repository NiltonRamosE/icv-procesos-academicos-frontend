// src/dashboard/groups/information/sections/ClassesList.tsx
import { BookOpen, Calendar, Clock } from "lucide-react";
import { type Class } from "@/dashboard/groups/information/types";

interface ClassesListProps {
  classes: Class[];
}

export default function ClassesList({ classes }: ClassesListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group cursor-pointer"
          >
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors">
                {classItem.class_name}
              </h4>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}