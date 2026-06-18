"use strict";

const path = require("path");
const fs = require("fs");
const { EntryPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PLUGIN_NAME = "GenerateHtmlPagesPlugin";
const PAGES_ALIAS = "@pages";

class GenerateHtmlPagesPlugin {
  /**
   * Reads the combined pages file produced by ProcessWebsiteStaticPages and registers
   * an HtmlWebpackPlugin instance (and a matching entry) for each page. Must be listed after
   * ProcessWebsiteStaticPages in webpack.config.js's plugins array, so the pages file is freshly
   * written before this runs.
   *
   * @param {string} [pagesJsonFile] Path to the combined pages file (relative to the project root).
   * @param {string} [templatesDir] Directory (relative to the project root) holding the page templates.
   * @param {object} [options]
   * @param {object} [options.site] Site-wide values exposed to templates as `site.*` (e.g. site.sitename).
   * @param {object} [options.partials] Named HTML snippet strings exposed to templates as `partials.*`.
   * @param {string} [options.pagesDir] Directory (relative to the project root) that the `@pages` alias
   *   in each page's `entry` field resolves to.
   */
  constructor(
    pagesJsonFile = "./.build/site/pages.json",
    templatesDir = "./src/templates",
    { site = {}, partials = {}, pagesDir = "./src/js/pages" } = {}
  ) {
    this.pagesJsonFile = pagesJsonFile;
    this.templatesDir = templatesDir;
    this.site = site;
    this.partials = partials;
    this.pagesDir = pagesDir;
  }

  apply(compiler) {
    const absPagesJsonFile = path.resolve(compiler.context, this.pagesJsonFile);
    const absTemplatesDir = path.resolve(compiler.context, this.templatesDir);
    const absPagesDir = path.resolve(compiler.context, this.pagesDir);

    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      this.generatePages(compiler, absPagesJsonFile, absTemplatesDir, absPagesDir);
    };

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tap(PLUGIN_NAME, run);
  }

  resolveEntryPath(entry, absPagesDir) {
    if (!entry || !entry.startsWith(PAGES_ALIAS)) return null;
    return path.join(absPagesDir, entry.slice(PAGES_ALIAS.length));
  }

  generatePages(compiler, absPagesJsonFile, absTemplatesDir, absPagesDir) {
    const { pages = [] } = JSON.parse(fs.readFileSync(absPagesJsonFile, "utf8"));

    const warn = (message) => {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.warnings.push(new Error(message));
      });
    };

    const registeredChunks = new Set();

    for (const page of pages) {
      let chunkName = null;

      const entryPath = this.resolveEntryPath(page.entry, absPagesDir);
      if (entryPath) {
        chunkName = path.basename(entryPath, path.extname(entryPath));

        if (!registeredChunks.has(chunkName)) {
          registeredChunks.add(chunkName);

          if (fs.existsSync(entryPath)) {
            new EntryPlugin(compiler.context, entryPath, chunkName).apply(compiler);
          } else {
            //warn(`${PLUGIN_NAME}: no entry script for "${page.url}" (expected ${entryPath})`);
            continue;
          }
        }
      }

      const templatePath = path.join(absTemplatesDir, page.template);
      if (!fs.existsSync(templatePath)) {
        warn(`${PLUGIN_NAME}: skipping "${page.url}" - template not found: ${templatePath}`);
        continue;
      }

      new HtmlWebpackPlugin({
        filename: page.page.replace(/^\/+/, ""),
        template: templatePath,
        chunks: chunkName ? [chunkName] : [],
        title: page.title,
        templateParameters: {
          pageurl: page.url,
          description: page.description,
          keywords: page.keywords.join(", "),
          jdb: page.jdb,
          date: page.date,
          site: this.site,
          partials: this.partials,
        },
      }).apply(compiler);
    }
  }
}

module.exports = GenerateHtmlPagesPlugin;
