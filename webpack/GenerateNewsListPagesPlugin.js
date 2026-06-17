"use strict";

const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PLUGIN_NAME = "GenerateNewsListPagesPlugin";
const PAGES_ALIAS = "@pages";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

class GenerateNewsListPagesPlugin {
  /**
   * Reads the slim news index produced by ProcessNewsHashAndIndex and registers an
   * HtmlWebpackPlugin instance for the news root, each year, and each year/month, using
   * templates/main.html (e.g. news/index.html, news/2026/index.html, news/2026/05/index.html).
   * Reuses the "news" chunk already registered by GenerateHtmlPagesPlugin (these listing pages
   * share the same @pages/news.ts entry as the overview/item pages), so no new webpack entries
   * are created here. Must be listed after ProcessNewsHashAndIndex and GenerateHtmlPagesPlugin
   * in webpack.config.js's plugins array.
   *
   * @param {string} [newsIndexFile] Path to the slim news index file (relative to the project root).
   * @param {string} [templatesDir] Directory (relative to the project root) holding the page templates.
   * @param {object} [options]
   * @param {object} [options.site] Site-wide values exposed to templates as `site.*` (e.g. site.sitename).
   * @param {object} [options.partials] Named HTML snippet strings exposed to templates as `partials.*`.
   * @param {string} [options.pagesDir] Directory (relative to the project root) that the `@pages` alias
   *   in `options.entry` resolves to, used to derive the shared webpack chunk name.
   * @param {string} [options.entry] The `@pages/...` entry shared by all the news listing pages.
   * @param {string} [options.description] Meta description for the listing pages.
   * @param {string} [options.keywords] Meta keywords for the listing pages.
   */
  constructor(
    newsIndexFile = "./.build/news/newsindex.json",
    templatesDir = "./src/templates",
    {
      site = {},
      partials = {},
      pagesDir = "./src/js/pages",
      entry = "@pages/news.ts",
      description = "Gordano Model Flying Club News.",
      keywords = "",
    } = {}
  ) {
    this.newsIndexFile = newsIndexFile;
    this.templatesDir = templatesDir;
    this.site = site;
    this.partials = partials;
    this.pagesDir = pagesDir;
    this.entry = entry;
    this.description = description;
    this.keywords = keywords;
  }

  apply(compiler) {
    const absNewsIndexFile = path.resolve(compiler.context, this.newsIndexFile);
    const absTemplatesDir = path.resolve(compiler.context, this.templatesDir);
    const absPagesDir = path.resolve(compiler.context, this.pagesDir);

    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      this.generatePages(compiler, absNewsIndexFile, absTemplatesDir, absPagesDir);
    };

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tap(PLUGIN_NAME, run);
  }

  resolveChunkName(entry, absPagesDir) {
    if (!entry || !entry.startsWith(PAGES_ALIAS)) return null;
    const entryPath = path.join(absPagesDir, entry.slice(PAGES_ALIAS.length));
    return path.basename(entryPath, path.extname(entryPath));
  }

  generatePages(compiler, absNewsIndexFile, absTemplatesDir, absPagesDir) {
    const templatePath = path.join(absTemplatesDir, "main.html");
    const warn = (message) => {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.warnings.push(new Error(message));
      });
    };

    if (!fs.existsSync(templatePath)) {
      warn(`${PLUGIN_NAME}: template not found: ${templatePath}`);
      return;
    }
    if (!fs.existsSync(absNewsIndexFile)) {
      warn(`${PLUGIN_NAME}: news index not found: ${absNewsIndexFile}`);
      return;
    }

    const items = JSON.parse(fs.readFileSync(absNewsIndexFile, "utf8"));
    const chunkName = this.resolveChunkName(this.entry, absPagesDir);
    const chunks = chunkName ? [chunkName] : [];

    const years = new Set();
    const yearMonths = new Set();
    for (const item of items) {
      const date = new Date(item.date);
      const year = String(date.getUTCFullYear());
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      years.add(year);
      yearMonths.add(`${year}/${month}`);
    }

    this.emitPage(compiler, templatePath, chunks, {
      pathParts: [],
      title: "News",
      year: "0",
      month: "0",
      jsonPath: "/news/index.json",
    });

    for (const year of years) {
      this.emitPage(compiler, templatePath, chunks, {
        pathParts: [year],
        title: `News ${year}`,
        year,
        month: "0",
        jsonPath: `/news/${year}/index.json`,
      });
    }

    for (const yearMonth of yearMonths) {
      const [year, month] = yearMonth.split("/");
      const monthName = MONTH_NAMES[Number(month) - 1] ?? month;
      this.emitPage(compiler, templatePath, chunks, {
        pathParts: [year, month],
        title: `News ${monthName} ${year}`,
        year,
        month,
        jsonPath: `/news/${year}/${month}/index.json`,
      });
    }
  }

  emitPage(compiler, templatePath, chunks, { pathParts, title, year, month, jsonPath }) {
    const urlPath = path.posix.join("/news", ...pathParts, "/");
    const filename = path.posix.join("news", ...pathParts, "index.html");

    new HtmlWebpackPlugin({
      filename,
      template: templatePath,
      chunks,
      title,
      templateParameters: {
        pageurl: urlPath,
        description: this.description,
        keywords: this.keywords,
        site: this.site,
        partials: this.partials,
        MY_NEWS_ITEM: {
          type: "list",
          json: jsonPath,
          year,
          month,
        },
      },
    }).apply(compiler);
  }
}

module.exports = GenerateNewsListPagesPlugin;
