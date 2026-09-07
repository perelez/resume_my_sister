import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project001: resolve(__dirname, 'project-001.html'),
        project002: resolve(__dirname, 'project-002.html'),
        project003: resolve(__dirname, 'project-003.html'),
        project005: resolve(__dirname, 'project-005.html'),
        publications: resolve(__dirname, 'publications.html'),
        contacts: resolve(__dirname, 'contacts.html'),
        creativedirection: resolve(__dirname, 'creative-direction.html'),
        
      },
    },
  },
});