"use strict";

const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "GenerateGalleryOrderedPlugin";

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function validateImageItem(item, index, file) {
  if (typeof item.name !== "string" || item.name.length === 0) {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] is missing a string "name"`);
  }
  if (!isValidDate(item.date)) {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] ("${item.name}") has an invalid "date"`);
  }
  if (typeof item.width !== "number" || typeof item.height !== "number") {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] ("${item.name}") is missing numeric "width"/"height"`);
  }
}

function validateVideoItem(item, index, file) {
  if (typeof item.youtubeurl !== "string" || item.youtubeurl.length === 0) {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] is missing a string "youtubeurl"`);
  }
  if (typeof item.title !== "string" || item.title.length === 0) {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] ("${item.youtubeurl}") is missing a string "title"`);
  }
  if (!isValidDate(item.date)) {
    throw new Error(`${PLUGIN_NAME}: ${file}[${index}] ("${item.youtubeurl}") has an invalid "date"`);
  }
}

class GenerateGalleryOrderedPlugin {
  /**
   * Reads the gallery (image) and video data files, validates their shape, tags each
   * item with a "type" ("image" or "video"), and writes them combined and ordered
   * newest-first by "date" to .build/gallery/gallery_ordered.json. Intermediate build
   * data, not a published asset.
   *
   * @param {string} [galleryDataFile] Path to gallery_data.json (relative to the project root).
   * @param {string} [videoDataFile] Path to video_data.json (relative to the project root).
   * @param {string} [outputDir] Directory (relative to the project root) to write the output file into.
   */
  constructor(
    galleryDataFile = "./src/database/media/gallery_data.json",
    videoDataFile = "./src/database/media/video_data.json",
    outputDir = "./.build/gallery",
  ) {
    this.galleryDataFile = galleryDataFile;
    this.videoDataFile = videoDataFile;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    const absGalleryDataFile = path.resolve(compiler.context, this.galleryDataFile);
    const absVideoDataFile = path.resolve(compiler.context, this.videoDataFile);
    const absOutputDir = path.resolve(compiler.context, this.outputDir);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absGalleryDataFile);
      compilation.fileDependencies.add(absVideoDataFile);
    });

    const run = () => this.process(absGalleryDataFile, absVideoDataFile, absOutputDir);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async process(absGalleryDataFile, absVideoDataFile, absOutputDir) {
    const images = JSON.parse(await fs.promises.readFile(absGalleryDataFile, "utf8"));
    const videos = JSON.parse(await fs.promises.readFile(absVideoDataFile, "utf8"));

    if (!Array.isArray(images)) {
      throw new Error(`${PLUGIN_NAME}: ${this.galleryDataFile} must contain a JSON array`);
    }
    if (!Array.isArray(videos)) {
      throw new Error(`${PLUGIN_NAME}: ${this.videoDataFile} must contain a JSON array`);
    }

    images.forEach((item, index) => validateImageItem(item, index, this.galleryDataFile));
    videos.forEach((item, index) => validateVideoItem(item, index, this.videoDataFile));

    const combined = [
      ...images.map((item) => ({ type: "image", ...item })),
      ...videos.map((item) => ({ type: "video", ...item })),
    ];

    const ordered = combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    await fs.promises.mkdir(absOutputDir, { recursive: true });
    await this.writeIfChanged(
      path.join(absOutputDir, "gallery_ordered.json"),
      JSON.stringify(ordered, null, 2),
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

module.exports = GenerateGalleryOrderedPlugin;
