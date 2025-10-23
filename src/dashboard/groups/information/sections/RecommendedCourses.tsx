// src/dashboard/groups/information/sections/RecommendedCourses.tsx
import { BookOpen } from "lucide-react";
import { type PreviousCourse } from "@/dashboard/groups/information/types";

interface RecommendedCoursesProps {
  courses: PreviousCourse[];
}

export default function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  return (
    <div className="bg-gradient-to-br from-[#201a2f] via-[#111115] to-[#000000] rounded-2xl p-8 md:p-10 border border-[#848282]/20 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r"></div>

      <div className="relative">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Cursos Recomendados
          </h2>
          <p className="text-[#848282]">
            Continúa tu aprendizaje con estos cursos relacionados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.previous_course_id}
              className="group bg-[#111115] hover:bg-[#201a2f] p-6 rounded-xl border border-[#848282]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-500/40 cursor-pointer"
              onClick={() => (window.location.href = `/academico/dashboard/catalogo`)}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium">
                  Recomendado
                </span>
              </div>

              <h3 className="font-semibold text-white text-lg group-hover:text-amber-400 transition-colors mb-3 line-clamp-2">
                {course.previous_course_title}
              </h3>

              <p className="text-sm text-[#848282] mb-4">
                Complementa tu formación con este curso relacionado
              </p>

              <button className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg font-medium transition-all border border-amber-500/30 hover:border-amber-500/50 text-sm">
                Ver Curso
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}