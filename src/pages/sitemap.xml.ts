import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";

/** Pages worth indexing. Campaign routes and /v1/ are left out on purpose: they point back to the root. */
const paths = ["/", "/course-content"];

export const GET: APIRoute = () => {
  const urls = siteConfig.url ? paths.map((p) => `<url><loc>${siteConfig.url}${p === "/" ? "/" : p}</loc></url>`).join("") : "";
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
