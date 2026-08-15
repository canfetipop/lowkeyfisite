import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const useCustomDomain = process.env.LOWKEYFI_CUSTOM_DOMAIN === "true";

export default defineConfig({
  // Keep the project-site path until lowkey-fi.com is purchased and connected.
  // The deployment can switch to a root path by setting LOWKEYFI_CUSTOM_DOMAIN=true.
  base: process.env.GITHUB_ACTIONS && !useCustomDomain ? "/lowkeyfisite/" : "/",
  plugins: [react()],
});
