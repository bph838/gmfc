"use strict";

const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "GenerateSitemapPlugin";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Priority falls off with path depth: the homepage is most important, then
// top-level sections, then their sub-pages, then auto-generated archive/detail
// pages (news articles, news year/month archives, gallery year pages).
function priorityForStaticPage(url) {
  if (url === "/") return "1.0";
  const segments = url.split("/").filter(Boolean).length;
  if (segments <= 1) return "0.8";
  if (segments === 2) return "0.6";
  return "0.5";
}

class GenerateSitemapPlugin {
  /**
   * Builds sitemap.xml from four sources:
   * - pages.json (produced by ProcessWebsiteStaticPages): each page's "url" and "date"
   *   (file-modified time), used as that page's lastmod.
   * - the news index (newsindex.json): each item's own "url" and "date" (lastmod), plus
   *   the /news/{year}/ and /news/{year}/{month}/ archive pages derived from "date",
   *   whose lastmod is the most recent item date within that year/month.
   * - years.json: a /gallery/{year}/ page for every year present in the gallery.
   * - the ordered gallery data (gallery_ordered.json): used only to find each gallery
   *   year's most recent item date, for that year page's lastmod.
   *
   * Writes the result to sitemap.xml. Must be listed after ProcessWebsiteStaticPages,
   * ProcessNewsHashAndIndex, GenerateGalleryYearsPlugin, and GenerateGalleryOrderedPlugin
   * in webpack.config.js's plugins array, so their build artifacts are freshly written
   * before this runs.
   *
   * @param {string} [pagesJsonFile] Path to pages.json (relative to the project root).
   * @param {string} [newsIndexFile] Path to the news index file (relative to the project root).
   * @param {string} [galleryYearsFile] Path to years.json (relative to the project root).
   * @param {string} [galleryOrderedFile] Path to the ordered gallery data file (relative to the project root).
   * @param {object} [options]
   * @param {string} [options.baseUrl] Site origin to prefix each path with, e.g. "https://www.gmfc.uk".
   * @param {string} [options.outputFile] Path (relative to the project root) to write the sitemap to.
   */
  constructor(
    pagesJsonFile = "./.build/site/pages.json",
    newsIndexFile = "./.build/news/newsindex.json",
    galleryYearsFile = "./src/database/generated/years.json",
    galleryOrderedFile = "./.build/gallery/gallery_ordered.json",
    { baseUrl = "https://www.gmfc.uk", outputFile = "./.build/site/sitemap.xml" } = {},
  ) {
    this.pagesJsonFile = pagesJsonFile;
    this.newsIndexFile = newsIndexFile;
    this.galleryYearsFile = galleryYearsFile;
    this.galleryOrderedFile = galleryOrderedFile;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.outputFile = outputFile;
  }

  apply(compiler) {
    const absPagesJsonFile = path.resolve(compiler.context, this.pagesJsonFile);
    const absNewsIndexFile = path.resolve(compiler.context, this.newsIndexFile);
    const absGalleryYearsFile = path.resolve(compiler.context, this.galleryYearsFile);
    const absGalleryOrderedFile = path.resolve(compiler.context, this.galleryOrderedFile);
    const absOutputFile = path.resolve(compiler.context, this.outputFile);

    const run = () => this.writeSitemap(
      absPagesJsonFile,
      absNewsIndexFile,
      absGalleryYearsFile,
      absGalleryOrderedFile,
      absOutputFile,
    );
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async writeSitemap(absPagesJsonFile, absNewsIndexFile, absGalleryYearsFile, absGalleryOrderedFile, absOutputFile) {
    const entries = this.collectEntries(
      absPagesJsonFile,
      absNewsIndexFile,
      absGalleryYearsFile,
      absGalleryOrderedFile,
    );
    const xml = this.buildXml(entries);

    // This file may live under a watched directory, so rewriting it unconditionally
    // on every watchRun (even with unchanged content) would retrigger the watcher
    // and rebuild forever. Only write when the content actually changes.
    if (fs.existsSync(absOutputFile)) {
      const existing = await fs.promises.readFile(absOutputFile, "utf8");
      if (existing === xml) return;
    }

    await fs.promises.mkdir(path.dirname(absOutputFile), { recursive: true });
    await fs.promises.writeFile(absOutputFile, xml);
  }

  // Sets/updates an entry, keeping the most recent lastmod if the URL is touched more
  // than once (e.g. a news year archive page is "visited" once per article in it).
  upsert(entries, url, lastmod, priority) {
    const existing = entries.get(url);
    if (!existing) {
      entries.set(url, { lastmod, priority });
      return;
    }
    if (lastmod && (!existing.lastmod || lastmod > existing.lastmod)) {
      existing.lastmod = lastmod;
    }
  }

  collectEntries(absPagesJsonFile, absNewsIndexFile, absGalleryYearsFile, absGalleryOrderedFile) {
    const entries = new Map();

    if (fs.existsSync(absPagesJsonFile)) {
      const { pages = [] } = JSON.parse(fs.readFileSync(absPagesJsonFile, "utf8"));
      for (const page of pages) {
        if (!page.url) continue;
        this.upsert(entries, page.url, toLastmod(page.date), priorityForStaticPage(page.url));
      }
    }

    if (fs.existsSync(absNewsIndexFile)) {
      const items = JSON.parse(fs.readFileSync(absNewsIndexFile, "utf8"));
      for (const item of items) {
        const lastmod = toLastmod(item.date);
        const date = new Date(item.date);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");

        if (item.url) this.upsert(entries, item.url, lastmod, "0.6");
        this.upsert(entries, `/news/${year}/`, lastmod, "0.4");
        this.upsert(entries, `/news/${year}/${month}/`, lastmod, "0.3");
      }
    }

    if (fs.existsSync(absGalleryYearsFile)) {
      const latestByYear = new Map();
      if (fs.existsSync(absGalleryOrderedFile)) {
        const galleryItems = JSON.parse(fs.readFileSync(absGalleryOrderedFile, "utf8"));
        for (const item of galleryItems) {
          const year = new Date(item.date).getUTCFullYear();
          const lastmod = toLastmod(item.date);
          if (lastmod && (!latestByYear.has(year) || lastmod > latestByYear.get(year))) {
            latestByYear.set(year, lastmod);
          }
        }
      }

      const years = JSON.parse(fs.readFileSync(absGalleryYearsFile, "utf8"));
      for (const year of years) {
        this.upsert(entries, `/gallery/${year}/`, latestByYear.get(year) ?? null, "0.5");
      }
    }

    return entries;
  }

  buildXml(entries) {
    const items = [...entries].map(([url, { lastmod, priority }]) => {
      const loc = `<loc>${escapeXml(`${this.baseUrl}${url}`)}</loc>`;
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      const priorityTag = `<priority>${priority}</priority>`;
      return `  <url>${loc}${lastmodTag}${priorityTag}</url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
  }
}

module.exports = GenerateSitemapPlugin;
