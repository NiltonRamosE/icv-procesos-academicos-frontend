/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 * Los endpoints estan divididos por secciones, como auth, users, clientes, productos y blogs.
 **/
export const config = {
  //apiUrl:"https://icv-procesos-academicos-847846098195.us-central1.run.app",
  apiUrl:"http://127.0.0.1:8000",
  environment:"development",
  endpoints: {
    auth: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
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
    },
    
    courses: {
      getAll: "/api/courses",
      getById: "/api/courses/:id",
      getGroups: "/api/courses/:id/groups",
      create: "/api/courses",
    },

    educationalMaterials: {
      getByGroup: "/api/groups/:groupId/materials",
      create: "/api/groups/:groupId/materials",
      update: "/api/groups/:groupId/materials/:materialId",
      delete: "/api/groups/:groupId/materials/:materialId",
      toggleVisibility: "/api/groups/:groupId/materials/:materialId/visibility",
    },
  },
};