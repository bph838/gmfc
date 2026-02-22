const fs = require("fs");

class KeywordsPlugin {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
  }

  // sync load (best for webpack configs)
  load() {
    const file = fs.readFileSync(this.filePath, "utf8");
    this.data = JSON.parse(file);
  }

  get(section,group) {
    return this.data[section][group] || [];
  }

 
  keywords(groups, separator = ", ") {
    let result = [];

    // no groups → all
    if (!groups) {
      result = Object.values(this.data).flat();
    }

    // single string
    else if (typeof groups === "string") {
      result = this.get("keywords",groups);
    }

    // array of groups
    else if (Array.isArray(groups)) {
      for (const g of groups) {
        result.push(...this.get("keywords",g));
      }
    }

    // remove duplicates just in case
    result = [...new Set(result)];

    return result.join(separator);
  }

  description(groups, separator = ", ") {
    let result = [];
   

    // single string
    if (typeof groups === "string") {
      result = this.get("description",groups);
    }

    // array of groups
    else if (Array.isArray(groups)) {
      for (const g of groups) {
        result.push(...this.get("description",g));
      }
    }

    // remove duplicates just in case
    result = [result];

    return result.join(separator);
  }
}

module.exports = KeywordsPlugin;
