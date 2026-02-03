// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

function tailwindViteIntegration() {
  return {
    name: 'tailwind-vite',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [tailwindcss()],
          },
        });
      },
    },
  };
}

export default defineConfig({
  integrations: [react(), tailwindViteIntegration()],
});
