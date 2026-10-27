import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";

export const GET: APIRoute = () => {
  const loc = siteConfig.url ? `${siteConfig.url}/` : null;
  const body = loc
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc></url></urlset>\n`
    : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
