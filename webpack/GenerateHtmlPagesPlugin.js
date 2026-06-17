"use strict";

const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PLUGIN_NAME = "GenerateHtmlPagesPlugin";

class GenerateHtmlPagesPlugin {
  /**
   * Reads the combined pages file produced by ProcessWebsiteStaticPages and registers
   * an HtmlWebpackPlugin instance for each page. Must be listed after ProcessWebsiteStaticPages
   * in webpack.config.js's plugins array, so the pages file is freshly written before this runs.
   *
   * @param {string} [pagesJsonFile] Path to the combined pages file (relative to the project root).
   * @param {string} [templatesDir] Directory (relative to the project root) holding the page templates.
   * @param {object} [options]
   * @param {object} [options.site] Site-wide values exposed to templates as `site.*` (e.g. site.sitename).
   * @param {object} [options.partials] Named HTML snippet strings exposed to templates as `partials.*`.
   */
  constructor(
    pagesJsonFile = "./.build/database/pages.json",
    templatesDir = "./src/templates",
    { site = {}, partials = {} } = {}
  ) {
    this.pagesJsonFile = pagesJsonFile;
    this.templatesDir = templatesDir;
    this.site = site;
    this.partials = partials;
  }

  apply(compiler) {
    const absPagesJsonFile = path.resolve(compiler.context, this.pagesJsonFile);
    const absTemplatesDir = path.resolve(compiler.context, this.templatesDir);

    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      this.generatePages(compiler, absPagesJsonFile, absTemplatesDir);
    };

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tap(PLUGIN_NAME, run);
  }

  generatePages(compiler, absPagesJsonFile, absTemplatesDir) {
    const { pages = [] } = JSON.parse(fs.readFileSync(absPagesJsonFile, "utf8"));

    for (const page of pages) {
      const templatePath = path.join(absTemplatesDir, page.template);
      if (!fs.existsSync(templatePath)) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
          compilation.warnings.push(
            new Error(`${PLUGIN_NAME}: skipping "${page.url}" - template not found: ${templatePath}`)
          );
        });
        continue;
      }

      new HtmlWebpackPlugin({
        filename: page.page.replace(/^\/+/, ""),
        template: templatePath,
        chunks: Array.isArray(page.chunks) ? page.chunks : [page.chunks],
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
