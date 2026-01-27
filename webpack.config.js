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
const { SITE_TITLE } = require("./src/js/constants.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const loadPartials = require("./webpack/plugins/load-partials");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  const partials = loadPartials();

  return {
    mode: isProd ? "production" : "development",

    entry: {
      index: "./src/pages/index.js",
      calendar: "./src/pages/calendar.js",
      news: "./src/pages/news.js",
      aboutus: "./src/pages/aboutus.js",
      gallery: "./src/pages/gallery.js",
      leaderboard: "./src/pages/club/leaderboard.js",
      clubrules: "./src/pages/club/clubrules.js",
      clubmerch: "./src/pages/club/clubmerch.js",
      styles: "./src/scss/styles.scss",
    },
    output: {
      filename: "js/[name].bundle.js", // main.bundle.js, about.bundle.js
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },

    devServer: {
      static: path.resolve(__dirname, "dist"),
      port: 8080,
      hot: true,
    },

    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/js/components"),
        "@framework": path.resolve(__dirname, "src/js/framework"),
        "@data": path.resolve(__dirname, "src/data"),
      },
      extensions: [".js", ".json"], // optional, helps omit extensions
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/data",
            to: "data",
            globOptions: {
              ignore: ["**/dynamic/**"], // <-- this skips any folder named "website" inside data
            },
          },
          { from: "src/images", to: "images" },
          { from: "src/favicon.ico", to: "." },
          { from: "src/site.webmanifest", to: "." },
        ],
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
        },
      }),

      //calendar.html
      new HtmlWebpackPlugin({
        filename: "calendar.html",
        template: "./src/templates/main.html",
        chunks: ["calendar"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //news.html
      new HtmlWebpackPlugin({
        filename: "news.html",
        template: "./src/templates/main.html",
        chunks: ["news"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //aboutus.html
      new HtmlWebpackPlugin({
        filename: "aboutus.html",
        template: "./src/templates/main.html",
        chunks: ["aboutus"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //gallery.html
      new HtmlWebpackPlugin({
        filename: "gallery.html",
        template: "./src/templates/main.html",
        chunks: ["gallery"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //clubrules.html
      new HtmlWebpackPlugin({
        filename: "club/clubrules.html",
        template: "./src/templates/main.html",
        chunks: ["clubrules"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //leaderboard.html
      new HtmlWebpackPlugin({
        filename: "club/leaderboard.html",
        template: "./src/templates/main.html",
        chunks: ["leaderboard"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
        },
      }),

      //clubmerch.html
      new HtmlWebpackPlugin({
        filename: "club/clubmerch.html",
        template: "./src/templates/main.html",
        chunks: ["clubmerch"],
        title: SITE_TITLE,
        templateParameters: {
          siteName: SITE_TITLE,
          partials,
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
      }),
      //keywords
      new KeywordsMetaPlugin({
        input: path.resolve(__dirname, "src/data/dynamic/keywords.json"),
        output: "src/partials/keywords.html",
      }),
    ],

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
