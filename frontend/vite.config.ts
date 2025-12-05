import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs'
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost+1-key.pem'),
      cert: fs.readFileSync('./localhost+1.pem'),
    },
    proxy: {
    '/api': {
      target: process.env.VITE_SERVER_URL || 'https://192.168.0.100:3000',
      changeOrigin: true,
      secure: false,
    }
  }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },

  define: {
    global: 'globalThis',
    'process.env': {},
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          
          if (id.includes('node_modules/react-pdf') || 
              id.includes('node_modules/pdfjs-dist')) {
            return 'pdf-viewer';
          }
          
          if (id.includes('node_modules/tailwind-merge')) {
            return 'tailwind-utils';
          }
          
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    
    minify: 'esbuild',
  },
  
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router',
      'buffer',
      'process',
    ],
  },
});
