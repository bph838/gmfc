"use strict";

const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "GenerateGalleryYearsPlugin";

function getYears(items) {
  const years = new Set(items.map((item) => new Date(item.date).getUTCFullYear()));
  return [...years].sort((a, b) => b - a);
}

class GenerateGalleryYearsPlugin {
  /**
   * Reads the combined gallery/video data produced by GenerateGalleryOrderedPlugin and
   * writes years.json, a JSON array of the years present in the gallery, newest first,
   * e.g. [2026, 2025, 2024]. Written before compilation so pages can statically
   * `import years from "@data/generated/years.json"`.
   *
   * Must be listed after GenerateGalleryOrderedPlugin in webpack.config.js's plugins
   * array, so the ordered gallery data is freshly written before this runs.
   *
   * @param {string} [galleryOrderedFile] Path to the ordered gallery data file (relative to the project root).
   * @param {string} [srcGeneratedFile] Path (relative to the project root) to write years.json to.
   */
  constructor(
    galleryOrderedFile = "./.build/gallery/gallery_ordered.json",
    srcGeneratedFile = "./src/database/generated/years.json",
  ) {
    this.galleryOrderedFile = galleryOrderedFile;
    this.srcGeneratedFile = srcGeneratedFile;
  }

  apply(compiler) {
    const absGalleryOrderedFile = path.resolve(compiler.context, this.galleryOrderedFile);
    const absSrcGeneratedFile = path.resolve(compiler.context, this.srcGeneratedFile);

    const run = () => this.writeSrcGeneratedFile(absGalleryOrderedFile, absSrcGeneratedFile);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async writeSrcGeneratedFile(absGalleryOrderedFile, absSrcGeneratedFile) {
    if (!fs.existsSync(absGalleryOrderedFile)) return;

    const items = JSON.parse(await fs.promises.readFile(absGalleryOrderedFile, "utf8"));
    const content = JSON.stringify(getYears(items), null, 2);

    // This file lives under src/, which webpack watches, so rewriting it
    // unconditionally would retrigger watchRun forever. Only write when changed.
    if (fs.existsSync(absSrcGeneratedFile)) {
      const existing = await fs.promises.readFile(absSrcGeneratedFile, "utf8");
      if (existing === content) return;
    }

    await fs.promises.mkdir(path.dirname(absSrcGeneratedFile), { recursive: true });
    await fs.promises.writeFile(absSrcGeneratedFile, content);
  }
}

module.exports = GenerateGalleryYearsPlugin;
