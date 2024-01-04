import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        '01': './src/01/index.html',
        '02': './src/02/index.html',
      },
    },
  },
});
