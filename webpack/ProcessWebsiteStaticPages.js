"use strict";

const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "CombinedMetaPlugin";
const JDBPAGES_ALIAS = "@jdbpages";
const JDBPAGES_DIR = "src/database/pages";
const JDBPAGES_PUBLIC_PATH = "/data";

function dedupe(values) {
  return [...new Set(values)];
}

class ProcessWebsiteStaticPages {
  /**
   * @param {string} pagesFile Path to the pages_static.json file (root description/keywords + pages list).
   * @param {string} [outputDir] Directory (relative to the project root) to write the combined pages file into.
   *   This is intermediate build data, not a published asset, so it lives outside the webpack output dir.
   * @param {string} [outputFile] Filename for the combined pages file, written inside outputDir.
   */
  constructor(pagesFile, outputDir = "./.build/database", outputFile = "pages.json") {
    this.pagesFile = pagesFile;
    this.outputDir = outputDir;
    this.outputFile = outputFile;
  }

  apply(compiler) {
    const absPagesFile = path.resolve(compiler.context, this.pagesFile);
    const absOutputDir = path.resolve(compiler.context, this.outputDir);
    const absOutputFile = path.join(absOutputDir, this.outputFile);
    const absJdbPagesDir = path.resolve(compiler.context, JDBPAGES_DIR);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absPagesFile);
    });

    const run = () => this.writeMetaFile(absPagesFile, absOutputDir, absOutputFile, absJdbPagesDir);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  resolveJdbPath(jdb, absJdbPagesDir) {
    if (!jdb || !jdb.startsWith(JDBPAGES_ALIAS)) return null;
    return path.join(absJdbPagesDir, jdb.slice(JDBPAGES_ALIAS.length));
  }

  async getDate(page, absJdbPagesDir) {
    if (page.datetype !== "filemodified") return undefined;

    const jdbPath = this.resolveJdbPath(page.jdb, absJdbPagesDir);
    if (!jdbPath) return null;

    try {
      const stats = await fs.promises.stat(jdbPath);
      return stats.mtime.toISOString();
    } catch {
      return null;
    }
  }

  async writeMetaFile(absPagesFile, absOutputDir, absOutputFile, absJdbPagesDir) {
    const { keywords: rootKeywords = [], description: rootDescription = "", pages = [] } =
      JSON.parse(await fs.promises.readFile(absPagesFile, "utf8"));

    const combinedPages = await Promise.all(
      pages.map(async (page) => {
        const date = await this.getDate(page, absJdbPagesDir);
        if (date === null) return null;

        const description = page.description
          ? `${page.description} ${rootDescription}`
          : rootDescription;
        const keywords = dedupe([...(page.keywords || []), ...rootKeywords]);
        const jdb = page.jdb.replace(JDBPAGES_ALIAS, JDBPAGES_PUBLIC_PATH);

        const { datetype, ...rest } = page;
        return { ...rest, description, keywords, jdb, date };
      })
    );

    await fs.promises.mkdir(absOutputDir, { recursive: true });
    await fs.promises.writeFile(
      absOutputFile,
      JSON.stringify({ pages: combinedPages.filter(Boolean) }, null, 2)
    );
  }
}

module.exports = ProcessWebsiteStaticPages;
