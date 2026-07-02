const fs = require("fs");
const path = require("path");

const partials = {
  google_analytics: "google_analytics.html",
  navigation: "navigation.html",
  footer: "footer.html",
  favicon: "favicon.html",
  google_fonts: "google_fonts.html",
};

const loadPartials = () => {
  

  const loaded = {};

  for (const [key, file] of Object.entries(partials)) {
    loaded[key] = fs.readFileSync(
      path.resolve(__dirname, "../src/templates/partials", file),
      "utf8",
    );
  }

  return loaded;
};

module.exports = loadPartials;
