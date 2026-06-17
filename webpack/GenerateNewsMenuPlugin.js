"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateNewsMenuPlugin";

function buildMenu(items) {
  const byYear = new Map();

  for (const item of items) {
    const date = new Date(item.date);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;

    if (!byYear.has(year)) byYear.set(year, new Set());
    byYear.get(year).add(month);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: [...months].sort((a, b) => b - a).map((month) => ({ month })),
    }));
}

class GenerateNewsMenuPlugin {
  /**
   * Reads the slim news index produced by ProcessNewsHashAndIndex and writes a menu.json
   * listing the years and months that have news items, newest first, e.g.
   * [{ year: 2026, months: [{ month: 5 }, { month: 3 }] }].
   *
   * Writes the file twice, for two different consumers:
   * - srcGeneratedFile, written before compilation (beforeRun/watchRun) so pages can
   *   statically `import menu from "@data/generated/menu.json"`.
   * - distOutputFile, emitted as a webpack asset (e.g. dist/news/menu.json) for any
   *   runtime fetch-based consumers.
   *
   * Must be listed after ProcessNewsHashAndIndex in webpack.config.js's plugins array, so
   * the news index is freshly written before this runs.
   *
   * @param {string} [newsIndexFile] Path to the slim news index file (relative to the project root).
   * @param {string} [srcGeneratedFile] Path (relative to the project root) to write the static-import copy to.
   * @param {string} [distOutputFile] Path (relative to the webpack output) to emit the runtime-fetch copy to.
   */
  constructor(
    newsIndexFile = "./.build/news/newsindex.json",
    srcGeneratedFile = "./src/database/generated/menu.json",
    distOutputFile = "news/menu.json",
  ) {
    this.newsIndexFile = newsIndexFile;
    this.srcGeneratedFile = srcGeneratedFile;
    this.distOutputFile = distOutputFile;
  }

  apply(compiler) {
    const absNewsIndexFile = path.resolve(compiler.context, this.newsIndexFile);
    const absSrcGeneratedFile = path.resolve(compiler.context, this.srcGeneratedFile);

    const run = () => this.writeSrcGeneratedFile(absNewsIndexFile, absSrcGeneratedFile);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          if (!fs.existsSync(absNewsIndexFile)) return;

          const items = JSON.parse(fs.readFileSync(absNewsIndexFile, "utf8"));
          const menu = buildMenu(items);

          compilation.emitAsset(this.distOutputFile, new sources.RawSource(JSON.stringify(menu, null, 2)));
        }
      );
    });
  }

  async writeSrcGeneratedFile(absNewsIndexFile, absSrcGeneratedFile) {
    if (!fs.existsSync(absNewsIndexFile)) return;

    const items = JSON.parse(await fs.promises.readFile(absNewsIndexFile, "utf8"));
    const content = JSON.stringify(buildMenu(items), null, 2);

    // Skip the write when unchanged: this file lives under src/, which webpack
    // watches, so rewriting it unconditionally would retrigger watchRun forever.
    if (fs.existsSync(absSrcGeneratedFile)) {
      const existing = await fs.promises.readFile(absSrcGeneratedFile, "utf8");
      if (existing === content) return;
    }

    await fs.promises.mkdir(path.dirname(absSrcGeneratedFile), { recursive: true });
    await fs.promises.writeFile(absSrcGeneratedFile, content);
  }
}

module.exports = GenerateNewsMenuPlugin;
