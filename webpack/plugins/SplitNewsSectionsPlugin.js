const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { RawSource } = require("webpack").sources;

class SplitNewsSectionsPlugin {
  constructor({ input, outputDir }) {
    this.input = input;
    this.outputDir = outputDir.replace(/\\/g, "/");
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "SplitNewsSectionsPlugin",
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: "SplitNewsSectionsPlugin",
            stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
          },
          () => {
            const inputPath = path.resolve(this.input);
            const raw = fs.readFileSync(inputPath, "utf8");
            const json = JSON.parse(raw);

            const sections = json?.content?.sections;
            if (!Array.isArray(sections)) return;

            sections.forEach(section => {
              const hash = crypto
                .createHash("md5")
                .update(`${section.title}|${section.date}`)
                .digest("hex");

              const output = {
                ...section,
                hash
              };

              const filename = `${this.outputDir}/${hash}.json`;

              compilation.emitAsset(
                filename,
                new RawSource(JSON.stringify(output, null, 2))
              );
            });
          }
        );
      }
    );
  }
}

module.exports = SplitNewsSectionsPlugin;
