import { defineConfig } from 'vite';

// Site multipage : chaque page HTML est un point d'entree Rollup.
// Chaque nouvelle page generee par Copilot doit etre ajoutee ici.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        accueil: 'index.html',
      },
    },
  },
});
