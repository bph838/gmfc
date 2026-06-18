"use strict";

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const PLUGIN_NAME = "ProcessNewsPlugin";

function sanitizeTitle(str) {
  if (typeof str !== "string") return "";
  // Replace anything that is NOT a letter or number with empty string
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashNewsItem(item) {
  return crypto
    .createHash("md5")
    .update(`${item.date}${item.title}`)
    .digest("hex");
}

class ProcessNewsPlugin {
  /**
   * Reads the raw news array, orders it (newest first), adds an md5 "hash" field
   * (derived from date + title) to each item, and writes the result plus a slim
   * lookup index to .build/news. Intermediate build data, not a published asset.
   *
   * @param {string} [newsRawFile] Path to the news-raw.json file (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the project root) to write the output files into.
   */
  constructor(
    newsRawFile = "./src/database/news/news-raw.json",
    outputDir = "./.build/news",
  ) {
    this.newsRawFile = newsRawFile;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    const absNewsRawFile = path.resolve(compiler.context, this.newsRawFile);
    const absOutputDir = path.resolve(compiler.context, this.outputDir);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absNewsRawFile);
    });

    const run = () => this.process(absNewsRawFile, absOutputDir);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async process(absNewsRawFile, absOutputDir) {
    const items = JSON.parse(
      await fs.promises.readFile(absNewsRawFile, "utf8"),
    );

    const ordered = [...items].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const hashed = ordered.map((item) => ({
      ...item,
      showhide: item.showhide ?? true,
      hash: hashNewsItem(item),
    }));

    const index = hashed.map(({ title, date, hash, showhide, image, click_image }) => {
      const d = new Date(date);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");

      return {
        title,
        date,
        hash,
        showhide,
        image: image ?? click_image?.image,
        url: `/news/${year}/${month}/${sanitizeTitle(title)}`,
        jsondata:`/news/${year}/${month}/${hash}.json`,
      };
    });

    await fs.promises.mkdir(absOutputDir, { recursive: true });
    await this.writeIfChanged(
      path.join(absOutputDir, "newsHash.json"),
      JSON.stringify(hashed, null, 2),
    );
    await this.writeIfChanged(
      path.join(absOutputDir, "newsindex.json"),
      JSON.stringify(index, null, 2),
    );
  }

  // Several plugins watch these output files as fileDependencies, so rewriting them
  // unconditionally on every watchRun (even with unchanged content) would retrigger
  // the watcher and rebuild forever. Only write when the content actually changes.
  async writeIfChanged(absFile, content) {
    if (fs.existsSync(absFile)) {
      const existing = await fs.promises.readFile(absFile, "utf8");
      if (existing === content) return;
    }
    await fs.promises.writeFile(absFile, content);
  }
}

module.exports = ProcessNewsPlugin;
