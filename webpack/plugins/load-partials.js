const fs = require("fs");
const path = require("path");

const partials = {
  google_analytics: "google_analytics.html",
  navigation: "navigation.html",
  footer: "footer.html",
};

const loadPartials = () => {
  const loaded = {};

  for (const [key, file] of Object.entries(partials)) {
    loaded[key] = fs.readFileSync(
      path.resolve(__dirname, "../../src/partials", file),
      "utf8"
    );
  }

  return loaded;
};

module.exports = loadPartials;
