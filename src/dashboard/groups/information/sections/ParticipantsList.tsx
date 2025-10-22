// src/dashboard/groups/information/sections/ParticipantsList.tsx
import { Users, User, GraduationCap } from "lucide-react";
import { type Participant } from "@/dashboard/groups/information/types";

interface ParticipantsListProps {
  participants: Participant[];
}

export default function ParticipantsList({ participants }: ParticipantsListProps) {
  return (
    <div className="bg-[#111115] rounded-xl border border-[#848282]/20 shadow-xl overflow-hidden">
      <div className="bg-[#201a2f] px-6 py-5 border-b border-[#848282]/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Participantes</h3>
          </div>
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30">
            {participants.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-[#848282]/10 max-h-96 overflow-y-auto">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="px-6 py-4 hover:bg-[#201a2f] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-full flex-shrink-0 transition-all ${
                    participant.role === "Instructor"
                      ? "bg-purple-500/20 group-hover:bg-purple-500/30"
                      : "bg-[#848282]/20 group-hover:bg-[#848282]/30"
                  }`}
                >
                  {participant.role === "Instructor" ? (
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  ) : (
                    <User className="w-5 h-5 text-[#848282]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {participant.name}
                  </p>
                  {participant.expertise_area && (
                    <p className="text-xs text-[#848282] mt-0.5 truncate">
                      {participant.expertise_area}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                  participant.role === "Instructor"
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : "bg-[#848282]/20 text-[#848282] border-[#848282]/30"
                }`}
              >
                {participant.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}