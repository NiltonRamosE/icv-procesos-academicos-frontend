import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CourseHistory() {
  const [completedGroups, setCompletedGroups] = useState<any[]>([]);

  useEffect(() => {
    // Aquí harías el fetch a tu API
    // fetch(`/api/groups?user_id=${user?.id}&status=completed`)
    setCompletedGroups([
      {
        id: 1,
        name: "Grupo A - Mañana",
        course: {
          name: "Desarrollo Web Fullstack",
          image: "/images/default-group-01.webp"
        },
        teacher: {
          name: "Juan Pérez",
          photo: "/images/9439727.webp"
        },
        start_date: "2023-07-15",
        end_date: "2023-12-15",
        progress: 100
      },
      {
        id: 2,
        name: "Grupo B - Tarde",
        course: {
          name: "Python Avanzado",
          image: "/images/default-group-02.webp"
        },
        teacher: {
          name: "María González",
          photo: "/images/9439729.webp"
        },
        start_date: "2023-06-01",
        end_date: "2023-11-30",
        progress: 100
      }
    ]);
  }, []);

  return (
    <section className="px-4 md:px-6 lg:px-10">
      {completedGroups.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No tienes cursos completados aún.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {completedGroups.map((group) => (
            <Card 
              key={group.id} 
              className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
              onClick={() => {
                window.location.href = `/groups/${group.id}`;
              }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={group.course.image}
                  alt={group.course.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.course.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.teacher.photo} />
                    <AvatarFallback>
                      {group.teacher.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{group.teacher.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Completado</span>
                    <span className="text-green-600 font-medium">100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}