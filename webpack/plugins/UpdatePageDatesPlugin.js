const fs = require("fs").promises;
const path = require("path");

class UpdatePageDatesPlugin {
  constructor(options = {}) {
    this.input = options.input;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise(
      "UpdatePageDatesPlugin",
      async () => {
        const logger = compiler.getInfrastructureLogger(
          "UpdatePageDatesPlugin"
        );

        logger.info("Updating page dates in source JSON…");

        try {
          const jsonPath = path.resolve(compiler.context, this.input);
          logger.info(`Reading ${jsonPath}`);

          const raw = await fs.readFile(jsonPath, "utf8");
          const data = JSON.parse(raw);

          if (!Array.isArray(data.pages)) {
            logger.warn("No pages array found");
            return;
          }

          const resolver = compiler.resolverFactory.get("normal");

          let changed = 0;

          for (const page of data.pages) {
            if (page.datetype !== "filemodified" || !page.jdb) continue;

            const resolved = await new Promise((resolve, reject) => {
              resolver.resolve(
                {},
                compiler.context,
                page.jdb,
                {},
                (err, result) => (err ? reject(err) : resolve(result))
              );
            });

            logger.info(`Resolved ${page.jdb} → ${resolved}`);

            const stat = await fs.stat(resolved);
            const newDate = stat.mtime.toISOString();

            if (page.date !== newDate) {
              page.date = newDate;
              changed++;
              logger.info(`Updated ${page.page} → ${newDate}`);
            }
          }

          if (changed > 0) {
            await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
            logger.info(`Wrote ${changed} updates to ${jsonPath}`);
          } else {
            logger.info("No changes needed");
          }
        } catch (err) {
          logger.error(err);
          throw err;
        }
      }
    );
  }
}

module.exports = UpdatePageDatesPlugin;
