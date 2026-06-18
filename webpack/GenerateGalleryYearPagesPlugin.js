"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateGalleryYearPagesPlugin";

class GenerateGalleryYearPagesPlugin {
  /**
   * Reads the combined gallery/video data produced by GenerateGalleryOrderedPlugin and
   * writes one file per year under the webpack output (e.g. dist/gallery/2026/gallery_year.json),
   * each containing the matching items from gallery_ordered.json. Must be listed after
   * GenerateGalleryOrderedPlugin in webpack.config.js's plugins array, so the ordered
   * gallery data is freshly written before this runs.
   *
   * @param {string} [galleryOrderedFile] Path to the ordered gallery data file (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the webpack output) to emit the year files into.
   */
  constructor(
    galleryOrderedFile = "./.build/gallery/gallery_ordered.json",
    outputDir = "gallery",
  ) {
    this.galleryOrderedFile = galleryOrderedFile;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    const absGalleryOrderedFile = path.resolve(compiler.context, this.galleryOrderedFile);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          if (!fs.existsSync(absGalleryOrderedFile)) return;

          const items = JSON.parse(fs.readFileSync(absGalleryOrderedFile, "utf8"));
          const byYear = new Map();

          for (const item of items) {
            const year = String(new Date(item.date).getUTCFullYear());
            if (!byYear.has(year)) byYear.set(year, []);
            byYear.get(year).push(item);
          }

          for (const [year, yearItems] of byYear) {
            const filename = path.posix.join(this.outputDir, year, "gallery_year.json");
            compilation.emitAsset(filename, new sources.RawSource(JSON.stringify(yearItems, null, 2)));
          }
        }
      );
    });
  }
}

module.exports = GenerateGalleryYearPagesPlugin;
