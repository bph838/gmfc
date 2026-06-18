"use strict";

const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PLUGIN_NAME = "GenerateGalleryYearHtmlPagesPlugin";

class GenerateGalleryYearHtmlPagesPlugin {
  /**
   * Reads the years.json file produced by GenerateGalleryYearsPlugin and registers an
   * HtmlWebpackPlugin instance for each year, using templates/main.html, e.g.
   * dist/gallery/2026/index.html. Reuses the "gallery" chunk already registered by
   * GenerateHtmlPagesPlugin for /gallery/index.html (same @pages/gallery.ts entry), so
   * no new webpack entries are created here. Must be listed after both
   * GenerateGalleryYearsPlugin and GenerateHtmlPagesPlugin in webpack.config.js's
   * plugins array.
   *
   * @param {string} [yearsJsonFile] Path to the gallery years file (relative to the project root).
   * @param {string} [templatesDir] Directory (relative to the project root) holding the page templates.
   * @param {object} [options]
   * @param {object} [options.site] Site-wide values exposed to templates as `site.*` (e.g. site.sitename).
   * @param {object} [options.partials] Named HTML snippet strings exposed to templates as `partials.*`.
   * @param {string} [options.template] Template filename (relative to templatesDir) to render each year page with.
   * @param {string} [options.chunk] Name of the webpack chunk to attach (shared with the main gallery page).
   * @param {string} [options.urlPrefix] URL prefix each year is appended to, e.g. "/gallery".
   * @param {string} [options.titlePrefix] Title prefix each year is appended to.
   * @param {string} [options.description] Meta description for each year page.
   * @param {string} [options.keywords] Meta keywords for each year page.
   */
  constructor(
    yearsJsonFile = "./src/database/generated/years.json",
    templatesDir = "./src/templates",
    {
      site = {},
      partials = {},
      template = "main.html",
      chunk = "gallery",
      urlPrefix = "/gallery",
      titlePrefix = "Gordano Model Flying Club | Gallery",
      description = "Gordano Model Flying Club gallery.",
      keywords = "",
    } = {}
  ) {
    this.yearsJsonFile = yearsJsonFile;
    this.templatesDir = templatesDir;
    this.site = site;
    this.partials = partials;
    this.template = template;
    this.chunk = chunk;
    this.urlPrefix = urlPrefix;
    this.titlePrefix = titlePrefix;
    this.description = description;
    this.keywords = keywords;
  }

  apply(compiler) {
    const absYearsJsonFile = path.resolve(compiler.context, this.yearsJsonFile);
    const absTemplatePath = path.resolve(compiler.context, this.templatesDir, this.template);

    let applied = false;
    const run = () => {
      if (applied) return;
      applied = true;
      this.generatePages(compiler, absYearsJsonFile, absTemplatePath);
    };

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tap(PLUGIN_NAME, run);
  }

  generatePages(compiler, absYearsJsonFile, absTemplatePath) {
    if (!fs.existsSync(absYearsJsonFile)) return;

    if (!fs.existsSync(absTemplatePath)) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.warnings.push(
          new Error(`${PLUGIN_NAME}: template not found: ${absTemplatePath}`)
        );
      });
      return;
    }

    const years = JSON.parse(fs.readFileSync(absYearsJsonFile, "utf8"));

    for (const year of years) {
      new HtmlWebpackPlugin({
        filename: path.posix.join("gallery", String(year), "index.html"),
        template: absTemplatePath,
        chunks: [this.chunk],
        title: `${this.titlePrefix} ${year}`,
        templateParameters: {
          pageurl: `${this.urlPrefix}/${year}`,
          description: this.description,
          keywords: this.keywords,
          site: this.site,
          partials: this.partials,
        },
      }).apply(compiler);
    }
  }
}

module.exports = GenerateGalleryYearHtmlPagesPlugin;
