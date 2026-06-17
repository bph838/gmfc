"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateNewsItemFilesPlugin";

class GenerateNewsItemFilesPlugin {
  /**
   * Reads the combined news file produced by ProcessNewsHashAndIndex and emits one JSON file
   * per item under the webpack output, named after its hash (e.g. dist/news/2026/05/<hash>.json),
   * containing every field of that item. Must be listed after ProcessNewsHashAndIndex in
   * webpack.config.js's plugins array, so the news file is freshly written before this runs.
   *
   * @param {string} [newsHashFile] Path to the combined news file (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the webpack output) to emit the per-item files into.
   */
  constructor(newsHashFile = "./.build/news/newsHash.json", outputDir = "news") {
    this.newsHashFile = newsHashFile;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    const absNewsHashFile = path.resolve(compiler.context, this.newsHashFile);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absNewsHashFile);

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          if (!fs.existsSync(absNewsHashFile)) return;

          const items = JSON.parse(fs.readFileSync(absNewsHashFile, "utf8"));

          for (const item of items) {
            const date = new Date(item.date);
            const year = String(date.getUTCFullYear());
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");

            const filename = path.posix.join(this.outputDir, year, month, `${item.hash}.json`);
            compilation.emitAsset(filename, new sources.RawSource(JSON.stringify(item, null, 2)));
          }
        }
      );
    });
  }
}

module.exports = GenerateNewsItemFilesPlugin;
