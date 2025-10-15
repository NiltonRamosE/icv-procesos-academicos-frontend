/**
 * @abstract Config file
 * @description Este archivo contiene la configuracion de la aplicacion.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 * Los endpoints estan divididos por secciones, como auth, users, clientes, productos y blogs.
 **/
export const config = {

    apiUrl:"http://127.0.0.1:8000", 
    environment:"development",
    endpoints: {
      auth: {
        login: "/api/auth/login",
        logout: "/api/auth/logout",
      },
    },
};