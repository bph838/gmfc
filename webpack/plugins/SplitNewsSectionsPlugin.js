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

            const absoluteOutputDir = path.resolve(this.outputDir);
            if (!fs.existsSync(absoluteOutputDir)) {
              fs.mkdirSync(absoluteOutputDir, { recursive: true });
            }
            console.log(`[SplitNewsSectionsPlugin] Output directory: ${absoluteOutputDir}`);

            // --- start fresh summary ---
            const summary = [];

            sections.forEach((section) => {
              try {
                const hash = crypto
                  .createHash("md5")
                  .update(`${section.title}|${section.date}`)
                  .digest("hex");

                // Write individual section JSON
                const sectionJson = {
                  content: {
                    hero: json.content.hero,
                    sections: [
                      {
                        ...section,
                        hash
                      }
                    ]
                  }
                };

                const outputFilePath = path.join(absoluteOutputDir, `${hash}.json`);
                if (!fs.existsSync(outputFilePath)) {
                  fs.writeFileSync(outputFilePath, JSON.stringify(sectionJson, null, 2));
                  console.log(`[SplitNewsSectionsPlugin] Wrote new JSON: ${outputFilePath}`);
                }

                const relativeFilename = path.relative(
                  compiler.options.output.path,
                  outputFilePath
                ).replace(/\\/g, "/");

                compilation.emitAsset(
                  relativeFilename,
                  new RawSource(JSON.stringify(sectionJson, null, 2))
                );

                // --- add to summary ---
                const dateObj = new Date(section.date);
                summary.push({
                  hash,
                  month: dateObj.getMonth() + 1,
                  year: dateObj.getFullYear(),
                  title: section.title,
                  image: section.image
                });

                // --- update site.json with unique entry ---
                const siteJsonPath = path.resolve(__dirname, "../../src/data/site.json");
                try {
                  let siteData = { pages: [] };
                  if (fs.existsSync(siteJsonPath)) {
                    const siteContent = fs.readFileSync(siteJsonPath, "utf8");
                    siteData = JSON.parse(siteContent);
                  }

                  // Check if entry with this hash already exists
                  const hashExists = siteData.pages && siteData.pages.some(page => page.hash === hash);
                  
                  if (!hashExists) {
                    // Add new entry
                    if (!siteData.pages) {
                      siteData.pages = [];
                    }
                    let pagetitle =  sanitize(section.title);
                    let month =  dateObj.getMonth() + 1;
                    let year =  dateObj.getFullYear();
                    siteData.pages.push({
                      hash,
                      page: `news/${year}/${month}/${pagetitle}.html`,
                      jdb: `@jdbpages/newsitems/${hash}.json`,
                      datetype: "static",
                      date: section.date,
                      title: section.title
                    });
                    fs.writeFileSync(siteJsonPath, JSON.stringify(siteData, null, 2));
                    console.log(`[SplitNewsSectionsPlugin] Added entry to site.json for hash: ${hash}`);
                  } else {
                    console.log(`[SplitNewsSectionsPlugin] Entry already exists in site.json for hash: ${hash}`);
                  }
                } catch (siteErr) {
                  console.error(`[SplitNewsSectionsPlugin] Error updating site.json:`, siteErr);
                }

                

              } catch (innerErr) {
                console.error(`[SplitNewsSectionsPlugin] Failed to process section: ${section.title}`, innerErr);
              }
            });

            // Write summary JSON once
            const summaryFilePath = path.join(absoluteOutputDir, `summary.json`);
            fs.writeFileSync(summaryFilePath, JSON.stringify(summary, null, 2));
            console.log(`[SplitNewsSectionsPlugin] Wrote summary JSON: ${summaryFilePath}`);

            const summaryRelative = path.relative(
              compiler.options.output.path,
              summaryFilePath
            ).replace(/\\/g, "/");

            compilation.emitAsset(
              summaryRelative,
              new RawSource(JSON.stringify(summary, null, 2))
            );

          } catch (err) {
            console.error("[SplitNewsSectionsPlugin] Error processing input JSON", err);
          }
        }
      );
    });
  }
}

// Utility to sanitize a string for a filename
function sanitize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


module.exports = SplitNewsSectionsPlugin;
