import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    testIsolation: false,
    viewportWidth: 1920, // Szerokość okna przeglądarki
    viewportHeight: 1080, // Wysokość okna przeglądarki
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
