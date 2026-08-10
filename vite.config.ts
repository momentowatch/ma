/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // GitHub Pages — project site: monentowatch/ma
    // القيمة تطابق اسم المستودع حرفياً: /<REPO>/ → /ma/
    // الرابط الحي: https://monentowatch.github.io/ma/
    // إن غيّرت اسم المستودع، غيّر معها: deploy.yml و quality.yml و playwright.config.ts.
    base: process.env.VITE_BASE_PATH ?? '/ma/',
    // src/data/watches.ts:133,170 يقرأ process.env.NODE_ENV في المتصفح.
    // حذف هذا السطر يُنتج "process is not defined" في الإنتاج.
    define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via the DISABLE_HMR env var.
      // File watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // السطر 1 (/// <reference types="vitest/config" />) إلزامي بسبب هذا البلوك.
    // بدونه يفشل `tsc --noEmit` بالخطأ TS2353 لأن UserConfig في Vite لا يعرف test.
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  };
});
