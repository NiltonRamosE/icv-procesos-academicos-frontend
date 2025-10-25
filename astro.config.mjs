// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    base: '/academico',
    site: "https://instituto.cetivirgendelapuerta.com/academico",
    integrations: [react()],
    vite: {
        plugins: [tailwindcss()],
        // ✅ CONFIGURACIÓN DEL PROXY PARA EVITAR CORS
        server: {
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path, // Mantiene la ruta como está
                },
            },
        },
    },
});