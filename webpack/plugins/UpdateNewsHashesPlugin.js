const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class UpdateNewsHashesPlugin {
  constructor(options) {
    this.filePath = options.filePath;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap("UpdateNewsHashesPlugin", () => {
      const absPath = path.resolve(this.filePath);

      const raw = fs.readFileSync(absPath, "utf8");
      const json = JSON.parse(raw);

      if (!json?.content?.sections) return;

      let changed = false;

      json.content.sections.forEach(section => {
        const source = `${section.title}|${section.date}`;
        const hash = crypto
          .createHash("md5")
          .update(source)
          .digest("hex");

        if (section.hash !== hash) {
          section.hash = hash;
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(
          absPath,
          JSON.stringify(json, null, 2),
          "utf8"
        );
        console.log("✔ News hashes updated");
      }
    });
  }
}

module.exports = UpdateNewsHashesPlugin;
