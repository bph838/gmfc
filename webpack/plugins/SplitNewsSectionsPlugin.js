const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { RawSource } = require("webpack").sources;

class SplitNewsSectionsPlugin {
  constructor({ input, outputDir }) {
    if (!input || !outputDir) {
      throw new Error("SplitNewsSectionsPlugin requires both 'input' and 'outputDir'");
    }
    this.input = input;
    this.outputDir = outputDir.replace(/\\/g, "/"); // normalize slashes
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("SplitNewsSectionsPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "SplitNewsSectionsPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        () => {
          try {
            const inputPath = path.resolve(this.input);
            console.log(`[SplitNewsSectionsPlugin] Reading input JSON from: ${inputPath}`);

            if (!fs.existsSync(inputPath)) {
              console.error(`[SplitNewsSectionsPlugin] Input file not found: ${inputPath}`);
              return;
            }

            const raw = fs.readFileSync(inputPath, "utf8");
            const json = JSON.parse(raw);

            const sections = json?.content?.sections;
            if (!Array.isArray(sections)) {
              console.warn("[SplitNewsSectionsPlugin] No sections found in JSON");
              return;
            }

            // Ensure output directory exists
            const absoluteOutputDir = path.resolve(this.outputDir);
            if (!fs.existsSync(absoluteOutputDir)) {
              fs.mkdirSync(absoluteOutputDir, { recursive: true });
            }
            console.log(`[SplitNewsSectionsPlugin] Output directory: ${absoluteOutputDir}`);

            sections.forEach((section) => {
              try {
                const hash = crypto
                  .createHash("md5")
                  .update(`${section.title}|${section.date}`)
                  .digest("hex");

                // Create a new JSON structure with only this section
                const sectionJson = {
                  content: {
                    hero: json.content.hero, // keep the original hero
                    sections: [
                      {
                        ...section,
                        hash, // update the hash
                      }
                    ]
                  }
                };

                const outputFilePath = path.join(absoluteOutputDir, `${hash}.json`);

                // Only write if file does not exist
                if (!fs.existsSync(outputFilePath)) {
                  fs.writeFileSync(outputFilePath, JSON.stringify(sectionJson, null, 2));
                  console.log(`[SplitNewsSectionsPlugin] Wrote new JSON: ${outputFilePath}`);
                } else {
                  console.log(`[SplitNewsSectionsPlugin] Skipping existing JSON: ${outputFilePath}`);
                }

                // Emit to Webpack
                const relativeFilename = path.relative(
                  compiler.options.output.path,
                  outputFilePath
                ).replace(/\\/g, "/");

                compilation.emitAsset(
                  relativeFilename,
                  new RawSource(JSON.stringify(sectionJson, null, 2))
                );

              } catch (innerErr) {
                console.error(`[SplitNewsSectionsPlugin] Failed to process section: ${section.title}`, innerErr);
              }
            });
          } catch (err) {
            console.error("[SplitNewsSectionsPlugin] Error processing input JSON", err);
          }
        }
      );
    });
  }
}

module.exports = SplitNewsSectionsPlugin;
