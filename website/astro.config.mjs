import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://github-flex.khuong.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', vi: 'vi', ja: 'ja' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
