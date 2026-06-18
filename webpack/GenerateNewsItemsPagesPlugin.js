"use strict";

const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "GenerateNewsItemsPagesPlugin";

class GenerateNewsItemsPagesPlugin {
  /**
   * Reads the slim news index produced by ProcessNewsHashAndIndex and writes a pages-shaped
   * record per news item to .build/site/newsitems.json (title/page/url/template/jdb/entry),
   * matching the shape GenerateHtmlPagesPlugin consumes. Intermediate build data, not a
   * published asset.
   *
   * @param {string} [newsIndexFile] Path to the slim news index file (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the project root) to write the output file into.
   * @param {string} [outputFile] Filename for the output file, written inside outputDir.
   */
  constructor(
    newsIndexFile = "./.build/news/newsindex.json",
    outputDir = "./.build/site",
    outputFile = "newsitems.json",
  ) {
    this.newsIndexFile = newsIndexFile;
    this.outputDir = outputDir;
    this.outputFile = outputFile;
  }

  apply(compiler) {
    const absNewsIndexFile = path.resolve(compiler.context, this.newsIndexFile);
    const absOutputDir = path.resolve(compiler.context, this.outputDir);
    const absOutputFile = path.join(absOutputDir, this.outputFile);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absNewsIndexFile);
    });

    const run = () =>
      this.process(absNewsIndexFile, absOutputDir, absOutputFile);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async process(absNewsIndexFile, absOutputDir, absOutputFile) {
    const items = JSON.parse(
      await fs.promises.readFile(absNewsIndexFile, "utf8"),
    );

    const newsItems = items.map((item) => ({
      title: item.title,
      page: `${item.url}.html`,
      url: item.url,
      template: "news.html",
      jdb: item.jsondata,
      entry: "@pages/news.ts",
      image: item.image,
      date: item.date,
    }));

    await fs.promises.mkdir(absOutputDir, { recursive: true });
    await fs.promises.writeFile(
      absOutputFile,
      JSON.stringify(newsItems, null, 2),
    );
  }
}

module.exports = GenerateNewsItemsPagesPlugin;
