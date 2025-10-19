export default function InformationGroup() {
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Simulación de datos que vendrán de la base de datos
    const fetchGroupData = async () => {
      const data = {
        id: 1,
        name: "Grupo de Capacitación en Desarrollo Web",
        description: "Este grupo está dedicado a enseñar habilidades en desarrollo web, incluyendo HTML, CSS, JavaScript, y frameworks modernos.",
        status: "Aprobado",
        start_date: "2025-10-20",
        end_date: "2025-12-20",
        participants: [
          { id: 1, name: "Juan Pérez", role: "Estudiante" },
          { id: 2, name: "Ana Gómez", role: "Estudiante" },
          { id: 3, name: "Carlos López", role: "Instructor", expertise_area: "Desarrollo Frontend" },  // Instructor con área de expertise
        ],
        classes: [
          { id: 1, class_name: "Introducción a HTML", class_date: "2025-10-21", start_time: "10:00", end_time: "12:00" },
          { id: 2, class_name: "CSS y Diseño Web", class_date: "2025-10-22", start_time: "14:00", end_time: "16:00" },
        ]
      };
      setGroup(data);
    };

    fetchGroupData();
  }, []);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <section className="p-10">
                {mounted && group ? (
                  <>
                    <h2 className="text-3xl font-bold mb-4">{group.name}</h2>
                    <p className="mb-6 text-lg">{group.description}</p>

                    {/* Información básica del grupo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="p-4 border rounded-lg">
                        <strong>Estado:</strong> {group.status}
                      </div>
                      <div className="p-4 border rounded-lg">
                        <strong>Fecha de inicio:</strong> {group.start_date}
                      </div>
                      <div className="p-4 border rounded-lg">
                        <strong>Fecha de fin:</strong> {group.end_date}
                      </div>
                    </div>

                    {/* Participantes */}
                    <h3 className="text-xl font-semibold mb-4">Participantes</h3>
                    <ul className="mb-6">
                      {group.participants.map((participant) => (
                        <li key={participant.id} className="flex justify-between p-3 border-b">
                          <span>{participant.name}</span>
                          <span className="text-gray-600">{participant.role}</span>
                          {participant.expertise_area && <span className="text-gray-500">({participant.expertise_area})</span>}
                        </li>
                      ))}
                    </ul>

                    {/* Clases programadas */}
                    <h3 className="text-xl font-semibold mb-4">Clases Programadas</h3>
                    <ul>
                      {group.classes.map((classItem) => (
                        <li key={classItem.id} className="flex justify-between p-3 border-b">
                          <div>
                            <strong>{classItem.class_name}</strong>
                            <div>{classItem.class_date} | {classItem.start_time} - {classItem.end_time}</div>
                          </div>
                          <span className="text-blue-600">Ver Detalles</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>Cargando información del grupo...</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
