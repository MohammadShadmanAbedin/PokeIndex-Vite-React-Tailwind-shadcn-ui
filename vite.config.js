import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // lets us write "@/components/..." instead of "../../components/..."
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
