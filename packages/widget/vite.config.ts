import { defineConfig } from 'vite';
export default defineConfig({ build: { lib: { entry: 'src/index.ts', name: 'NeiaWidget', formats: ['iife'], fileName: () => 'neia-widget.js' }, outDir: '../../apps/web/public/widget', emptyOutDir: false } });
