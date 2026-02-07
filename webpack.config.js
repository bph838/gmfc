"use strict";

const fs = require("fs");
const path = require("path");

const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const UpdateNewsHashesPlugin = require("./webpack/plugins/UpdateNewsHashesPlugin");
const SplitNewsSectionsPlugin = require("./webpack/plugins/SplitNewsSectionsPlugin");
const JsonToIcsPlugin = require("./webpack/plugins/JsonToIcsPlugin");
const KeywordsMetaPlugin = require("./webpack/plugins/KeywordsMetaPlugin");
const AlertHashPlugin = require("./webpack/plugins/AlertHashPlugin");
const GeneratePathsPlugin = require("./webpack/plugins/GeneratePathsPlugin");
const UpdatePageDatesPlugin = require("./webpack/plugins/UpdatePageDatesPlugin");
const ExcelToCsvAndJsonPlugin = require("./webpack/plugins/ExcelToCsvAndJsonPlugin.js");
const {
  SITE_TITLE,
  SITE_DESCRIPTION,
} = require("./src/js/components/constants.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const loadPartials = require("./webpack/plugins/load-partials");

const site = {
  sitename: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

let newsPlugins = [];
try {
  // Load your JSON data
  const newsItems = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "src/data/newsitems/summary.json"),
      "utf8",
    ),
  );

  const outputPath = path.resolve(__dirname, "dist");
  // Create an array of HtmlWebpackPlugin instances
  newsPlugins = newsItems.map((item) => {
    const filename = `/news/${item.year}/${item.month}/${sanitize(item.title)}.html`;
    console.log(`Processing new item for: ${filename}`);
    const absoluteFilename = path.resolve(outputPath, filename);

    console.log(`Processing new item for: ${absoluteFilename}`);

    return new HtmlWebpackPlugin({
      filename,
      template: path.resolve(__dirname, "src/templates/news.html"),
      inject: "body",
      chunks: ["news"],
      templateParameters: {
        title: SITE_TITLE + " - News - " + item.title,
        image: item.image,
        month: item.month,
        year: item.year,
        hash: item.hash,
        partials: loadPartials(),
        site: site,
      },
    });
  });
} catch (err) {
  console.warn("WebPack may need to be run again...");
  if (err.code === "ENOENT") {
    console.warn("summary.json not found — continuing with empty news list");
  } else {
    throw err; // real error → still crash
  }
}

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  const partials = loadPartials();

  return {
    mode: isProd ? "production" : "development",

    entry: {
      index: "./src/pages/index.js",
      404: "./src/pages/404.js",
      calendar: "./src/pages/calendar.js",
      news: "./src/pages/news.js",
      aboutus: "./src/pages/aboutus.js",
      gallery: "./src/pages/gallery.js",
      leaderboard: "./src/pages/club/leaderboard.js",
      clubrules: "./src/pages/club/rules.js",
      clubmerch: "./src/pages/club/merch.js",
      clubmember: "./src/pages/club/member.js",
      cubhistory: "./src/pages/club/history.js",
      styles: "./src/scss/styles.scss",
    },
    output: {
      filename: "js/[name].bundle.js", // main.bundle.js, about.bundle.js
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,
    },

    devServer: {
      static: path.resolve(__dirname, "dist"),
      port: 8080,
      hot: true,
      historyApiFallback: {
        index: "/404.html",

        rewrites: [
          // specific exception
          { from: /^\/news\/?$/, to: "/news.html" },

          // only rewrite paths WITHOUT extensions
          {
            from: /^(?!.*\.\w+$).*/,
            to: (ctx) => `${ctx.parsedUrl.pathname.replace(/\/$/, "")}.html`,
          },
        ],
      },
    },

    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/js/components"),
        "@framework": path.resolve(__dirname, "src/js/framework"),
        "@data": path.resolve(__dirname, "src/data"),
        "@jdbpages": path.resolve(__dirname, "src/data/pages"),
      },
      extensions: [".js", ".json"], // optional, helps omit extensions
    },

    plugins: [
      ...newsPlugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/data",
            to: "data",
            globOptions: {
              ignore: ["**/dynamic/**", "**/documents/**", "**/site.json"],
            },
          },
          {
            from: "src/images",
            to: "images",
            globOptions: {
              ignore: [
                "**/carousel/**",
                "**/cartrack/**",
                "**/crawl/**",
                "**/flying/**",
                "**/hero/**",
                "**/news/**",
                "**/racing/**",
                "**/favicon/**",
                "**/icons/**",
                "**/siteimages/**",
              ],
            },
          },
          { from: "src/rootdir/favicon.ico", to: "." },
          { from: "src/rootdir/site.webmanifest", to: "." },
          { from: "src/rootdir/sitemap.xml", to: "." },
          { from: "src/rootdir/robots.txt", to: "." },
        ],
      }),

      //404.html
      new HtmlWebpackPlugin({
        filename: "404.html",
        template: "./src/templates/main.html",
        chunks: ["404"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //index.html
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./src/templates/main.html",
        chunks: ["index"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //calendar.html
      new HtmlWebpackPlugin({
        filename: "calendar.html",
        template: "./src/templates/main.html",
        chunks: ["calendar"],
        title: SITE_TITLE + " - Calendar",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //news.html
      new HtmlWebpackPlugin({
        filename: "news/index.html",
        template: "./src/templates/main.html",
        chunks: ["news"],
        title: SITE_TITLE + " - News",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //news.html
      new HtmlWebpackPlugin({
        filename: "news.html",
        template: "./src/templates/main.html",
        chunks: ["news"],
        title: SITE_TITLE + " - News",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //aboutus.html
      new HtmlWebpackPlugin({
        filename: "aboutus.html",
        template: "./src/templates/main.html",
        chunks: ["aboutus"],
        title: SITE_TITLE + " - About Us",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //gallery.html
      new HtmlWebpackPlugin({
        filename: "gallery.html",
        template: "./src/templates/main.html",
        chunks: ["gallery"],
        title: SITE_TITLE + " - Gallery",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //clubindex.html
      new HtmlWebpackPlugin({
        filename: "club/index.html",
        template: "./src/templates/main.html",
        chunks: ["clubrules"],
        title: SITE_TITLE + " - Club Rules",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //clubrules.html
      new HtmlWebpackPlugin({
        filename: "club/rules.html",
        template: "./src/templates/main.html",
        chunks: ["clubrules"],
        title: SITE_TITLE + " - Club Rules",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //club/history.html
      new HtmlWebpackPlugin({
        filename: "club/history.html",
        template: "./src/templates/main.html",
        chunks: ["cubhistory"],
        title: SITE_TITLE + " - Club History",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //leaderboard.html
      new HtmlWebpackPlugin({
        filename: "club/leaderboard.html",
        template: "./src/templates/main.html",
        chunks: ["leaderboard"],
        title: SITE_TITLE + " - Leaderboard",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //clubmerch.html
      new HtmlWebpackPlugin({
        filename: "club/merch.html",
        template: "./src/templates/main.html",
        chunks: ["clubmerch"],
        title: SITE_TITLE + " - Club Merch",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //clubmember.html
      new HtmlWebpackPlugin({
        filename: "club/member.html",
        template: "./src/templates/iframe_membermojo_holder.html",
        chunks: ["clubmember"],
        title: SITE_TITLE + " - Members",
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
          site: site,
        },
      }),

      //css
      new MiniCssExtractPlugin({
        filename: "styles/styles.css", // output CSS file name
      }),
      //Update club news hash
      new UpdateNewsHashesPlugin({
        filePath: "src/data/pages/news.json",
      }),
      //Split the news
      new SplitNewsSectionsPlugin({
        input: "src/data/pages/news.json",
        outputDir: "src/data/newsitems", // relative to Webpack output (dist/)
      }),
      //ics file
      new JsonToIcsPlugin({
        input: "src/data/calendarevents.json",
        output: "calendar.ics",
        prodId: "-//" + SITE_TITLE + "//Club Calendar//EN",
        nameId: SITE_TITLE,
      }),
      //keywords
      new KeywordsMetaPlugin({
        input: path.resolve(__dirname, "src/data/dynamic/keywords.json"),
        output: "src/partials/keywords.html",
      }),
      //output leaderboard
      new ExcelToCsvAndJsonPlugin({
        input: path.resolve(__dirname, "src/data/dynamic/leaderboard.xlsx"),
        sheetName: "Leaderboard", // Your Excel sheet name
        csvOutput: "src/data/dynamic/leaderboard.csv", // Where CSV will go
        jsonOutput: "src/data/leaderboard.json", // Where JSON will go
      }),
      //hash the alerts
      new AlertHashPlugin({
        file: "./src/data/alerts.json",
      }),
      //new GeneratePathsPlugin(),
      new UpdatePageDatesPlugin({
        input: "src/data/site.json",
      }),
    ],
    watchOptions: {
      ignored: [
        "**/src/data/dynamic/**",
        "**/src/data/leaderboard.json",
        "**/src/data/newsitems/summary.json",
        "**/src/data/alerts.json",
      ],
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },

    module: {
      rules: [
        {
          test: /\.scss$/i,
          use: [
            MiniCssExtractPlugin.loader, // extract CSS to separate file
            "css-loader", // translates CSS into CommonJS
            "postcss-loader", // optional, for autoprefixing
            {
              loader: "sass-loader", // compiles SCSS to CSS
              options: {
                sassOptions: {
                  quietDeps: true, // <- hides warnings from dependencies like Bootstrap
                },
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
  };
};

// Utility to sanitize a string for a filename
function sanitize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
