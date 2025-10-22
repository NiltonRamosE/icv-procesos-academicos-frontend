// src/dashboard/groups/information/sections/GroupStats.tsx
import { Calendar, Users, BookOpen } from "lucide-react";
import { type Group } from "@/dashboard/groups/information/types";

interface GroupStatsProps {
  group: Group;
}

export default function GroupStats({ group }: GroupStatsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-[#848282]">Inicio</span>
        </div>
        <p className="text-base font-semibold text-white">{formatDate(group.start_date)}</p>
      </div>

      <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-500/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-[#848282]">Fin</span>
        </div>
        <p className="text-base font-semibold text-white">{formatDate(group.end_date)}</p>
      </div>

      <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-500/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-[#848282]">Miembros</span>
        </div>
        <p className="text-base font-semibold text-white">{group.participants.length}</p>
      </div>

      <div className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-500/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-sm font-medium text-[#848282]">Clases</span>
        </div>
        <p className="text-base font-semibold text-white">{group.classes.length}</p>
      </div>
    </div>
  );
}