import {
  BookOpen,
  Bot,
  GraduationCap,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react"
import {
  IconDatabase,
  IconReport,
  IconHelp,
  IconSearch,
  IconSettings,
  type Icon
} from "@tabler/icons-react"

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavSimpleItem {
  title: string;
  url: string;
  icon: Icon;
}

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

const urlManagementGroup = "/academico/dashboard/gestion-grupos";
const urlCourses = "/academico/dashboard/cursos";
const urlGraduates = "/academico/dashboard/graduates";
const urlAttendance = "/academico/dashboard/asistencia";


export const navMainCollapse: NavItem[] = [
  {
    title: "Mis Cursos",
    url: urlCourses,
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: "Unirme a un grupo",
        url: "/academico/dashboard/catalogo",
      },
      {
        title: "Historial de Cursos",
        url: `${urlCourses}#historial`,
      },
      {
        title: "Crear grupo",
        url: `${urlCourses}#crear-grupo`,
      },
      {
        title: "Crear Curso",
        url:`${urlCourses}#crear-curso`
      }
    ],
  },
  {
    title: "Seguimiento Egresados",
    url: urlGraduates,
    icon: GraduationCap,
    items: [
      {
        title: "Encuestas",
        url: `${urlGraduates}#encuestas`,
      },
      {
        title: "Perfil Laboral",
        url: `${urlGraduates}#perfil-laboral`,
      },
      {
        title: "Estadísticas",
        url: `${urlGraduates}#estadisticas`,
      },
    ],
  },

  {
    title: "Asistencia",
    url: urlAttendance,
    icon: ClipboardCheck,
    items: [
      {
        title: "Registro de Asistencia",
        url: `${urlAttendance}#`,
      },
      {
        title: "Estadísticas",
        url: `${urlAttendance}#estadisticas-asistencia`,
      },
    ],
  },
];

export const navSimpleMain: NavSimpleItem[] = [
  /* {
    title: "Gestión de Grupos",
    url: `${urlManagementGroup}`,
    icon: IconSettings,
  }, */
  {
    title: "Catálogo de Cursos",
    url: "/academico/dashboard/catalogo",
    icon: IconDatabase,
  },
];

export const navMainOptions: NavSimpleItem[] = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
];