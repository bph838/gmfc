"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateNewsIndexPlugin";

class GenerateNewsIndexPlugin {
  /**
   * Reads the slim news index produced by ProcessNewsHashAndIndex and writes an index.json
   * at the news root (all items), per year, and per year/month under the webpack output
   * (e.g. dist/news/index.json, dist/news/2026/index.json, dist/news/2026/05/index.json),
   * each containing the matching items from newsindex.json. Must be listed after
   * ProcessNewsHashAndIndex in webpack.config.js's plugins array, so the news index is
   * freshly written before this runs.
   *
   * @param {string} [newsIndexFile] Path to the slim news index file (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the webpack output) to emit the index files into.
   */
  constructor(newsIndexFile = "./.build/news/newsindex.json", outputDir = "news") {
    this.newsIndexFile = newsIndexFile;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    const absNewsIndexFile = path.resolve(compiler.context, this.newsIndexFile);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absNewsIndexFile);

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          if (!fs.existsSync(absNewsIndexFile)) return;

          const items = JSON.parse(fs.readFileSync(absNewsIndexFile, "utf8"));
          const byYear = new Map();
          const byYearMonth = new Map();

          for (const item of items) {
            const date = new Date(item.date);
            const year = String(date.getUTCFullYear());
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");

            if (!byYear.has(year)) byYear.set(year, []);
            byYear.get(year).push(item);

            const monthKey = `${year}/${month}`;
            if (!byYearMonth.has(monthKey)) byYearMonth.set(monthKey, []);
            byYearMonth.get(monthKey).push(item);
          }

          this.emitIndex(compilation, [], items);
          for (const [year, yearItems] of byYear) {
            this.emitIndex(compilation, [year], yearItems);
          }
          for (const [monthKey, monthItems] of byYearMonth) {
            this.emitIndex(compilation, monthKey.split("/"), monthItems);
          }
        }
      );
    });
  }

  emitIndex(compilation, pathParts, items) {
    const filename = path.posix.join(this.outputDir, ...pathParts, "index.json");
    compilation.emitAsset(filename, new sources.RawSource(JSON.stringify(items, null, 2)));
  }
}

module.exports = GenerateNewsIndexPlugin;
