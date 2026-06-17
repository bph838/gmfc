"use strict";

const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PLUGIN_NAME = "GenerateNewsHtmlPagesPlugin";
const PAGES_ALIAS = "@pages";

class GenerateNewsHtmlPagesPlugin {
  /**
   * Reads the news pages file produced by GenerateNewsItemsPagesPlugin and registers an
   * HtmlWebpackPlugin instance for each news item, using templates/news.html. Reuses the
   * "news" chunk already registered by GenerateHtmlPagesPlugin (every item shares the same
   * @pages/news.ts entry), so no new webpack entries are created here. Must be listed after
   * both GenerateNewsItemsPagesPlugin and GenerateHtmlPagesPlugin in webpack.config.js's
   * plugins array.
   *
   * @param {string} [newsItemsJsonFile] Path to the news pages file (relative to the project root).
   * @param {string} [templatesDir] Directory (relative to the project root) holding the page templates.
   * @param {object} [options]
   * @param {object} [options.site] Site-wide values exposed to templates as `site.*` (e.g. site.sitename).
   * @param {object} [options.partials] Named HTML snippet strings exposed to templates as `partials.*`.
   * @param {string} [options.pagesDir] Directory (relative to the project root) that the `@pages` alias
   *   in each item's `entry` field resolves to, used to derive the shared webpack chunk name.
   * @param {string} [options.description] Fallback meta description when an item has none.
   * @param {string} [options.keywords] Fallback meta keywords when an item has none.
   * @param {string} [options.image] Fallback og:image when an item has none.
   */
  constructor(
    newsItemsJsonFile = "./.build/site/newsitems.json",
    templatesDir = "./src/templates",
    {
      site = {},
      partials = {},
      pagesDir = "./src/js/pages",
      description = "Gordano Model Flying Club News.",
      keywords = "",
      image = "",
    } = {}
  ) {
    this.newsItemsJsonFile = newsItemsJsonFile;
    this.templatesDir = templatesDir;
    this.site = site;
    this.partials = partials;
    this.pagesDir = pagesDir;
    this.defaultDescription = description;
    this.defaultKeywords = keywords;
    this.defaultImage = image;
  }

  apply(compiler) {
    const absNewsItemsJsonFile = path.resolve(compiler.context, this.newsItemsJsonFile);
    const absTemplatesDir = path.resolve(compiler.context, this.templatesDir);
    const absPagesDir = path.resolve(compiler.context, this.pagesDir);

    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      this.generatePages(compiler, absNewsItemsJsonFile, absTemplatesDir, absPagesDir);
    };

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tap(PLUGIN_NAME, run);
  }

  resolveChunkName(entry, absPagesDir) {
    if (!entry || !entry.startsWith(PAGES_ALIAS)) return null;
    const entryPath = path.join(absPagesDir, entry.slice(PAGES_ALIAS.length));
    return path.basename(entryPath, path.extname(entryPath));
  }

  generatePages(compiler, absNewsItemsJsonFile, absTemplatesDir, absPagesDir) {
    if (!fs.existsSync(absNewsItemsJsonFile)) return;

    const items = JSON.parse(fs.readFileSync(absNewsItemsJsonFile, "utf8"));

    const warn = (message) => {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.warnings.push(new Error(message));
      });
    };

    for (const item of items) {
      const templatePath = path.join(absTemplatesDir, item.template);
      if (!fs.existsSync(templatePath)) {
        warn(`${PLUGIN_NAME}: skipping "${item.url}" - template not found: ${templatePath}`);
        continue;
      }

      const chunkName = this.resolveChunkName(item.entry, absPagesDir);
      const date = new Date(item.date);
      const hash = path.basename(item.jdb, ".json");

      new HtmlWebpackPlugin({
        filename: item.page.replace(/^\/+/, ""),
        template: templatePath,
        chunks: chunkName ? [chunkName] : [],
        title: item.title,
        templateParameters: {
          pageurl: item.url,
          title: item.title,
          description: item.description ?? this.defaultDescription,
          keywords: item.keywords ?? this.defaultKeywords,
          image: item.image ?? this.defaultImage,
          hash,
          urlJson: item.jdb,
          year: String(date.getUTCFullYear()),
          month: String(date.getUTCMonth() + 1).padStart(2, "0"),
          site: this.site,
          partials: this.partials,
        },
      }).apply(compiler);
    }
  }
}

module.exports = GenerateNewsHtmlPagesPlugin;
