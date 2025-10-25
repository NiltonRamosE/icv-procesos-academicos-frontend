// src/shared/site.ts
import {
  BookOpen,
  Bot,
  GraduationCap,
  ClipboardCheck,
  type LucideIcon,
  Users,
  UserCog,
  ShieldCheck,
  ClipboardList,
  GraduationCap as TeacherIcon,
} from "lucide-react"
import {
  IconDatabase,
  IconReport,
  IconHelp,
  IconSearch,
  IconSettings,
  type Icon
} from "@tabler/icons-react"

// EXPORTAR las interfaces
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    adminOnly?: boolean;
  }[];
  adminOnly?: boolean;
}

export interface NavSimpleItem {
  title: string;
  url: string;
  icon: Icon;
  adminOnly?: boolean;
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
      /* {
        title: "Estadísticas",
        url: `${urlAttendance}#estadisticas-asistencia`,
      }, */
    ],
  },
  // NUEVA SECCIÓN: ADMINISTRACIÓN (solo visible para admins)
  {
    title: "Administración",
    url: "#",
    icon: ShieldCheck,
    adminOnly: true,
    items: [
      {
        title: "Panel Admin",
        url: "/academico/admin",
        adminOnly: true
      },
      {
        title: "Gestión Estudiantes",
        url: "/academico/admin/estudiantes",
        adminOnly: true
      },
      {
        title: "Gestión Docentes",
        url: "/academico/admin/docentes", 
        adminOnly: true
      },
      {
        title: "Cursos Pendientes",
        url: "/academico/admin/cursos-pendientes",
        adminOnly: true
      },
      {
        title: "Administradores",
        url: "/academico/admin/administradores",
        adminOnly: true
      },
    ],
  },
];

export const navSimpleMain: NavSimpleItem[] = [
  {
    title: "Catálogo de Cursos",
    url: "/academico/dashboard/catalogo",
    icon: IconDatabase,
  },
];

export const navAdminSecondary: NavSimpleItem[] = [
  {
    title: "Panel de Administración",
    url: "/academico/admin",
    icon: IconSettings,
    adminOnly: true
  },
  {
    title: "Gestión Estudiantes", 
    url: "/academico/admin/estudiantes",
    icon: IconReport,
    adminOnly: true
  },
  {
    title: "Gestión Docentes",
    url: "/academico/admin/docentes",
    icon: IconHelp, 
    adminOnly: true
  },
  {
    title: "Cursos Pendientes",
    url: "/academico/admin/cursos-pendientes",
    icon: IconSearch,
    adminOnly: true
  }
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