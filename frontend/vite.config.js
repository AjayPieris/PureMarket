import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Helps ensure only one copy of React is bundled
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});