// src/dashboard/groups/information/sections/GroupHeader.tsx
import { useState } from "react";
import { ArrowLeft, Edit, MoreVertical, Award, CheckCircle2, Users } from "lucide-react";
import { config } from "config";
import { type Group } from "@/dashboard/groups/information/types";

interface GroupHeaderProps {
  group: Group;
  user: any;
  token: string | null;
  onBack: () => void;
  onRefresh: () => void;
}

export default function GroupHeader({ group, user, token, onBack, onRefresh }: GroupHeaderProps) {
  const [joining, setJoining] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "aprobado":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "open":
      case "pending":
      case "pendiente":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "draft":
      case "rechazado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completado";
      case "open":
        return "Abierto";
      case "draft":
        return "Borrador";
      default:
        return status;
    }
  };

  const handleJoinGroup = async () => {
    if (!token || !group) return;

    setJoining(true);

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, "");
      const endpoint = `${config.apiUrl}${config.endpoints.groups.join}`.replace(":id", group.id.toString());

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al unirse al grupo");
      }

      alert("¡Te has unido al grupo exitosamente!");
      onRefresh();
    } catch (err) {
      console.error("Error joining group:", err);
      alert(err instanceof Error ? err.message : "Error al unirse al grupo");
    } finally {
      setJoining(false);
    }
  };

  const isUserInGroup = user && group.participants.some((p) => p.id === user?.id);

  return (
    <>
      {/* Breadcrumb y acciones */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
            onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const courseId = params.get("courseId");
                window.location.href = `/academico/dashboard/grupos-disponibles?courseId=${courseId}`;
            }}
            className="flex items-center gap-2 text-[#848282] hover:text-white transition-colors group z-50"
        >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver a Mis Grupos</span>
        </button>


        <div className="flex items-center gap-3 z-50">
          <button 
            onClick={() => window.location.href = `/academico/dashboard/courses/modulo-educativo?groupId=${group.id}`}
            className="p-2 hover:bg-[#201a2f] rounded-lg transition-colors border border-[#848282]/20"
          >
            <Edit className="w-5 h-5 text-[#848282] hover:text-blue-400 transition-colors" />
          </button>
          <button 
            onClick={() => window.location.href = `/academico/dashboard/gestion-grupos?groupId=${group.id}`}
            className="p-2 hover:bg-[#201a2f] rounded-lg transition-colors border border-[#848282]/20"
          >
            <MoreVertical className="w-5 h-5 text-[#848282]" />
          </button>
        </div>
      </div>

      {/* Header con título y estado */}
      <div className="relative bg-gradient-to-br from-[#201a2f] via-[#111115] to-[#000000] rounded-2xl p-8 md:p-10 border border-[#848282]/20 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">Grupo #{group.id}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {group.name}
              </h1>
              <p className="text-[#848282] text-base md:text-lg leading-relaxed mb-4">
                {group.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${getStatusColor(group.status)}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {getStatusLabel(group.status)}
                </div>
              </div>

              {user && !isUserInGroup && (
                <div className="mt-4 relative z-50">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleJoinGroup}
                    disabled={joining}
                  >
                    <Users className="w-4 h-4" />
                    {joining ? "Uniéndose..." : "Unirme a este Grupo"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}