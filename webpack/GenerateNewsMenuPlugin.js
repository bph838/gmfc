"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateNewsMenuPlugin";

class GenerateNewsMenuPlugin {
  /**
   * Reads the slim news index produced by ProcessNewsHashAndIndex and writes a menu.json
   * under the webpack output (e.g. dist/news/menu.json) listing the years and months that
   * have news items, newest first, e.g. [{ year: 2026, months: [{ month: 5 }, { month: 3 }] }].
   * Must be listed after ProcessNewsHashAndIndex in webpack.config.js's plugins array, so the
   * news index is freshly written before this runs.
   *
   * @param {string} [newsIndexFile] Path to the slim news index file (relative to the project root).
   * @param {string} [outputFile] Path (relative to the webpack output) to write the menu file to.
   */
  constructor(newsIndexFile = "./.build/news/newsindex.json", outputFile = "news/menu.json") {
    this.newsIndexFile = newsIndexFile;
    this.outputFile = outputFile;
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

          for (const item of items) {
            const date = new Date(item.date);
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1;

            if (!byYear.has(year)) byYear.set(year, new Set());
            byYear.get(year).add(month);
          }

          const menu = [...byYear.entries()]
            .sort(([a], [b]) => b - a)
            .map(([year, months]) => ({
              year,
              months: [...months].sort((a, b) => b - a).map((month) => ({ month })),
            }));

          compilation.emitAsset(this.outputFile, new sources.RawSource(JSON.stringify(menu, null, 2)));
        }
      );
    });
  }
}

module.exports = GenerateNewsMenuPlugin;
