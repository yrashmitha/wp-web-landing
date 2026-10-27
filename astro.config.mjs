import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL || undefined;

export default defineConfig({
  site,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: "auto" },
});