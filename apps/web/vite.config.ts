import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 5173, proxy: { '/api': { target: 'http://localhost:3001', configure: (proxy) => { proxy.on('proxyReq', (proxyRequest) => { if (!proxyRequest.hasHeader('origin')) proxyRequest.setHeader('origin', 'http://localhost:5173'); }); } } } } });
