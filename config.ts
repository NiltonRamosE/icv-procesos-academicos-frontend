/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 * Los endpoints estan divididos por secciones, como auth, users, clientes, productos y blogs.
 **/

// ✅ Detectar si estamos en desarrollo o producción
const isDevelopment = import.meta.env.DEV;

export const config = {
  // En desarrollo: usa proxy (vacío), en producción: usa la URL completa
  apiUrl: isDevelopment 
    ? "" // El proxy de Astro maneja /api automáticamente
    : "https://instituto.cetivirgendelapuerta.com/academico/backend/public",
  
  environment: isDevelopment ? "development" : "production",
  
  endpoints: {

    users: {
      getById: "/api/users/:id",
      update: "/api/users/:id"
    },

    auth: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      register: "/api/auth/register",
      redirect: "/auth/google/redirect",
      callback: "/auth/google/callback",
    },
      
    groups: {
      getById: "/api/groups/:id",
      getAnnouncements: "/api/groups/:id/announcements",
      createAnnouncement: "/api/groups/:id/announcements",
      getEvaluations: "/api/groups/:id/evaluations",
      createEvaluation: "/api/groups/:id/evaluations",
      getGrades: "/api/groups/:id/grades",
      getParticipants: "/api/groups/:id/participants",
      getClasses: "/api/groups/:id/classes",
      createClass: "/api/groups/:id/classes",
      create: "/api/groups",
      complete: "/api/groups/:groupId/complete",
      join: "/api/groups/:id/join",
      getGroupsCompleted: "/api/groups/completed/:userId"
    },
    
    courses: {
      getAll: "/api/courses",
      getById: "/api/courses/:id",
      getGroups: "/api/courses/:id/groups",
      create: "/api/courses",
    },

    graduates: {
      // Employment Profile
      getProfile: "/api/employment-profile",
      updateProfile: "/api/employment-profile",
      deleteProfile: "/api/employment-profile",
      
      // Surveys
      getSurveys: "/api/surveys",
      getSurveyById: "/api/surveys/:id",
      submitSurvey: "/api/surveys/:id/response",
      
      // Admin: Survey Management
      createSurvey: "/api/surveys",
      updateSurvey: "/api/surveys/:id",
      deleteSurvey: "/api/surveys/:id",
      
      // Admin: Statistics
      getStatistics: "/api/graduate-statistics",
      exportReport: "/api/graduate-statistics/export",
    },

    classes: {
      getByGroup: "/api/classes/group/:groupId",
      create: "/api/classes",
      update: "/api/classes/:class",
      delete: "/api/classes/:class",
    },

    materials: {
      list: "/api/class-materials",
      create: "/api/class-materials",
      update: "/api/class-materials/:materialId",
      delete: "/api/class-materials/:materialId",
      getByClass: "/api/classes/:classId/materials",
    },

    attendance: {
      getByGroup: "/api/attendance/group/:groupId",
      getByStudent: "/api/attendance/student/:studentId",
      markAttendance: "/api/attendance/mark",
      getStatistics: "/api/attendance/statistics/:groupId",
      getByClass: "/api/attendance/class/:classId",
    },

    certificates: {
      generate: "/api/credentials/:credentialId/pdf",
      download: "/api/certificates/download/:certificateId",
      verify: "/api/certificates/verify/:code",
    },

    evaluations: {
      getByGroup: "/api/evaluations/group/:groupId",
      create: "/api/evaluations",
    },

    grades: {
      getByGroup: "/api/grade-records/group/:groupId",
      create: "/api/grade-records",
      update: "/api/grade-records/:gradeRecordId",
      delete: "/api/grade-records/:gradeRecordId",
    }
  },
};