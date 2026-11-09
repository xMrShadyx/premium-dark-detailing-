/**
 * Static hosts (GitHub Pages) have no SPA rewrites. After `vite build`, emit:
 *   dist/bg/index.html  — Bulgarian entry (deep links and refresh work)
 *   dist/en/index.html  — English entry with English <html lang>, title and description
 *   dist/404.html       — fallback for any other path
 * Asset URLs in index.html are absolute (prefixed with the Vite base), so copies work in subfolders.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist");
const html = readFileSync(resolve(dist, "index.html"), "utf8");
const en = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "src/locales/en.json"), "utf8"));

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const englishHtml = html
  .replace(/<html lang="bg">/, '<html lang="en">')
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(en.meta.title)}</title>`)
  .replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escape(en.meta.description)}" />`,
  );

for (const [dir, content] of [
  ["bg", html],
  ["en", englishHtml],
]) {
  mkdirSync(resolve(dist, dir), { recursive: true });
  writeFileSync(resolve(dist, dir, "index.html"), content);
}
writeFileSync(resolve(dist, "404.html"), html);

// Admin panel entry (same bundle, lazy chunk). Not for search engines.
mkdirSync(resolve(dist, "admin"), { recursive: true });
writeFileSync(
  resolve(dist, "admin", "index.html"),
  html.replace("<head>", '<head>\n    <meta name="robots" content="noindex, nofollow" />'),
);

console.log("postbuild: wrote bg/, en/, admin/ index.html and 404.html");
