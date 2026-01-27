const fs = require("fs");
const path = require("path");

class KeywordsMetaPlugin {
  constructor(options = {}) {
    this.input = options.input;           // path to JSON
    this.output = options.output;         // full path to write HTML
    console.log("[KeywordsMetaPlugin] Constructed");
    console.log("[KeywordsMetaPlugin] Input:", this.input);
    console.log("[KeywordsMetaPlugin] Output:", this.output);
  }

  apply(compiler) {
    compiler.hooks.done.tap("KeywordsMetaPlugin", () => {
      console.log("[KeywordsMetaPlugin] Build done, writing keywords...");

      try {
        const jsonPath = path.resolve(this.input);
        const keywords = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        if (!Array.isArray(keywords)) {
          throw new Error("keywords.json must be an array of strings");
        }

        const content = keywords.join(", ");
        const html = `<meta name="keywords" content="${content}" />\n`;

        // Ensure folder exists
        const dir = path.dirname(this.output);
        fs.mkdirSync(dir, { recursive: true });

        // Write directly to source folder
        fs.writeFileSync(this.output, html, "utf8");
        console.log(`[KeywordsMetaPlugin] Written keywords file: ${path.resolve(this.output)}`);
      } catch (err) {
        console.error("[KeywordsMetaPlugin] ERROR writing keywords:", err);
      }
    });
  }
}

module.exports = KeywordsMetaPlugin;