import {
  BookOpen,
  Bot,
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

const urlManagementGroup = "/dashboard/gestion-grupos";
const urlCourses = "/dashboard/cursos";

export const navMainCollapse: NavItem[] = [
  {
    title: "Mis Cursos",
    url: urlCourses,
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: "Unirme a un grupo",
        url: "/dashboard/catalogo",
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
    title: "Gestión de Grupos",
    url: urlManagementGroup,
    icon: Bot,
    items: [
      {
        title: "Anuncios",
        url: `${urlManagementGroup}/#`,
      },
      {
        title: "Evaluaciones",
        url: `${urlManagementGroup}/#`,
      },
      {
        title: "Calificaciones",
        url: `${urlManagementGroup}/#`,
      },
      {
        title: "Participantes",
        url: `${urlManagementGroup}/#`,
      },
      {
        title: "Clases",
        url: `${urlManagementGroup}/#`,
      },
    ],
  },
];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Catálogo de Cursos",
    url: "/dashboard/catalogo",
    icon: IconDatabase,
  },
  /* {
    title: "Información de Grupos",
    url: "/dashboard/informacion-grupos",
    icon: IconReport,
  }, */
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