"use strict";

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const PLUGIN_NAME = "AddSectionHashIdPlugin";

function hashSection(item) {
  return crypto.createHash("md5").update(JSON.stringify(item)).digest("hex");
}

function findJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

class AddSectionHashIdPlugin {
  /**
   * Recursively scans the pages directory and adds an md5 "hashId" field to
   * every item in content.sections that doesn't already have one. Mutates the
   * source JSON files in place so the id is stable across builds.
   *
   * @param {string} [pagesDir] Directory (relative to the project root) to scan.
   */
  constructor(pagesDir = "./src/database/pages") {
    this.pagesDir = pagesDir;
  }

  apply(compiler) {
    const absPagesDir = path.resolve(compiler.context, this.pagesDir);

    const run = () => this.process(absPagesDir);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async process(absPagesDir) {
    if (!fs.existsSync(absPagesDir)) {
      console.warn(`[${PLUGIN_NAME}] Pages directory not found: ${absPagesDir}`);
      return;
    }

    for (const file of findJsonFiles(absPagesDir)) {
      await this.processFile(file);
    }
  }

  async processFile(file) {
    const raw = await fs.promises.readFile(file, "utf8");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`[${PLUGIN_NAME}] Failed to parse ${file}: ${err.message}`);
      return;
    }

    const sections = data?.content?.sections;
    if (!Array.isArray(sections)) return;

    let changed = false;
    for (const item of sections) {
      if (item && typeof item === "object" && !item.hashId) {
        item.hashId = hashSection(item);
        changed = true;
      }
    }

    if (!changed) return;

    await fs.promises.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`[${PLUGIN_NAME}] Added hashId(s) in ${path.relative(process.cwd(), file)}`);
  }
}

module.exports = AddSectionHashIdPlugin;
