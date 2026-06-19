"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const STATIC_PAGES_FILE = path.resolve(
  __dirname,
  "../src/database/site/pages_static.json",
);
const BUILT_PAGES_FILE = path.resolve(__dirname, "../.build/site/pages.json");

test("pages.json has an entry for every page in pages_static.json", () => {
  const { pages: staticPages } = JSON.parse(
    fs.readFileSync(STATIC_PAGES_FILE, "utf8"),
  );
  const { pages: builtPages } = JSON.parse(
    fs.readFileSync(BUILT_PAGES_FILE, "utf8"),
  );

  //assert.equal(1, 1);
  assert.equal(
    builtPages.length,
    staticPages.length,
    `expected ${staticPages.length} pages from pages_static.json, but .build/site/pages.json has ${builtPages.length}`,
  );
});
