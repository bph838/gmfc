const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class AlertHashPlugin {
  constructor(options = {}) {
    this.file = options.file; // path to alerts.json
  }

  md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap("AlertHashPlugin", () => {
      const filePath = path.resolve(this.file);

      if (!fs.existsSync(filePath)) return;

      const raw = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(raw);

      let changed = false;

      if (Array.isArray(data.alerts)) {
        data.alerts = data.alerts.map(alert => {
          // create hash from ALL fields except hash itself
          const { hash, ...rest } = alert;
          const newHash = this.md5(JSON.stringify(rest));

          if (hash !== newHash) {
            changed = true;
          }

          return { ...rest, hash: newHash };
        });
      }

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log("AlertHashPlugin → hashes updated");
      }
    });
  }
}

module.exports = AlertHashPlugin;
