import { loadContent } from "../src/content/content-loader";

try {
  const { page, sections } = loadContent();
  console.log(`landing-page.json is valid: ${sections.length} enabled sections (${sections.join(", ")}), ${page.personalization.options.length} audiences, paid course, status ${page.site.status}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
