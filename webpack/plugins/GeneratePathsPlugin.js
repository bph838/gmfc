const path = require("path");

class GeneratePathsPlugin {
  constructor(options = {}) {}

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "GeneratePathsPlugin",
      (compilation, callback) => {
        // Get all HTML files from the final assets
        const htmlFiles = Object.keys(compilation.assets).filter((f) =>
          f.endsWith(".html"),
        );
        console.log("[GeneratePathsPlugin] HTML files found:", htmlFiles);

        // Convert filenames to site paths
        const paths = htmlFiles.map((filename) => {
          let pathStr =
            "/" + filename.replace(/index\.html$/, "").replace(/\.html$/, "");
          if (pathStr !== "/" && pathStr.endsWith("/"))
            pathStr = pathStr.slice(0, -1);
          return pathStr;
        });

        console.log("[GeneratePathsPlugin] Paths generated:", paths);
      },
    );
  }
}

module.exports = GeneratePathsPlugin;
