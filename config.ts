/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 * Los endpoints estan divididos por secciones, como auth, users, clientes, productos y blogs.
 **/
export const config = {
  //apiUrl:"https://instituto.cetivirgendelapuerta.com/academico/backend/public",
  apiUrl:"http://127.0.0.1:8000",
  environment:"development",
  endpoints: {
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
      getSurveys: "/api/graduates/surveys",
      submitSurvey: "/api/graduates/surveys",
      getProfile: "/api/graduates/profile",
      updateProfile: "/api/graduates/profile",
      getStatistics: "/api/graduates/statistics",
      getEmploymentData: "/api/graduates/employment",
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

  },
};