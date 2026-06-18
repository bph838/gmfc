"use strict";

const path = require("path");
const fs = require("fs");
const { sources, Compilation } = require("webpack");

const PLUGIN_NAME = "GenerateAlertsPlugin";

class GenerateAlertsPlugin {
  /**
   * Reads the site alerts file, drops any historical alerts (those whose "date_to" has
   * already passed), and emits the remaining alerts as alerts.json under the webpack
   * output (e.g. dist/alerts.json).
   *
   * @param {string} [alertsFile] Path to alerts.json (relative to the project root).
   * @param {string} [outputFile] Path (relative to the webpack output) to emit the filtered file to.
   */
  constructor(alertsFile = "./src/database/site/alerts.json", outputFile = "data/site/alerts.json") {
    this.alertsFile = alertsFile;
    this.outputFile = outputFile;
  }

  apply(compiler) {
    const absAlertsFile = path.resolve(compiler.context, this.alertsFile);

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.fileDependencies.add(absAlertsFile);

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          if (!fs.existsSync(absAlertsFile)) return;

          const alerts = JSON.parse(fs.readFileSync(absAlertsFile, "utf8"));
          const now = Date.now();

          const current = alerts.filter((alert) => {
            if (!alert.date_to) return true;
            return new Date(alert.date_to).getTime() >= now;
          });

          compilation.emitAsset(this.outputFile, new sources.RawSource(JSON.stringify(current, null, 2)));
        }
      );
    });
  }
}

module.exports = GenerateAlertsPlugin;
