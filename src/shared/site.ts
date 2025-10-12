export const siteConfig = {
  name: "INSTITUTO DE CAPACITACIÓN VIRTUAL EN EL PERÚ - PROCESOS ACADÉMICOS",
  description:
    "Instituto de Capacitación Virtual en el Perú - Procesos Académicos es un servicio que brinda la Universidad Nacional del Santa",
  navItems: [
    {
      label: "Iniciar Sesion",
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: "Iniciar Sesion",
      href: "/",
    },
  ],
};

const urlHome = "/docs";
export const navHomeItems: { title: string; href: string; description: string }[] = [
  {
    title: "Introduction",
    href: `${urlHome}`,
    description:
      "Re-usable components built using Radix UI and Tailwind CSS.",
  },
  {
    title: "Installation",
    href: `${urlHome}/installation`,
    description:
      "How to install dependencies and structure your app.",
  },
  {
    title: "Typography",
    href: `${urlHome}/primitives/typography`,
    description:
      "Styles for headings, paragraphs, lists...etc",
  },
]

const urlManagementGroup = "/dashboard/gestion-grupos";
export const navManagementGroupItems: { title: string; href: string; description: string }[] = [
  {
    title: "Anuncios",
    href: `${urlManagementGroup}/#1`,
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Evaluaciones",
    href: `${urlManagementGroup}/#2`,
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Calificaciones",
    href: `${urlManagementGroup}/#3`,
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Participantes",
    href: `${urlManagementGroup}/#4`,
    description: "Visually or semantically separates content.",
  },
  {
    title: "Clases",
    href: `${urlManagementGroup}/#5`,
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
]

const urlCourses = "/dashboard/cursos";
export const navCoursesItems: { title: string; href: string; description: string }[] = [
  {
    title: "Unirme a un grupo",
    href: `${urlCourses}/#1`,
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Historial de Cursos",
    href: `${urlCourses}/#2`,
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Crear grupo",
    href: `${urlCourses}/#3`,
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
]