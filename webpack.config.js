"use strict";

const path = require("path");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ProcessWebsiteStaticPages = require("./webpack/ProcessWebsiteStaticPages");
const GenerateHtmlPagesPlugin = require("./webpack/GenerateHtmlPagesPlugin");
const loadPartials = require("./webpack/load-partials");

const partials = loadPartials();

module.exports = {
  mode: "development",
  //entry: "./src/js/main.ts",
  entry: { index: "./src/js/pages/index.ts", styles: "./src/scss/styles.scss" },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
    devtoolModuleFilenameTemplate: (info) =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    hot: true,
  },
  plugins: [
    new ProcessWebsiteStaticPages("./src/database/pages_static.json"),
    new GenerateHtmlPagesPlugin(
      "./.build/database/pages.json",
      "./src/templates",
      {
        site: {
          sitename: "Gordano Model Flying Club",
        },
        partials: partials,
      },
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/database/pages/*",
          to: "data/[name][ext]",
          globOptions: {
            ignore: [],
          },
        },

        { from: "src/rootdir/favicon.ico", to: "." },
        { from: "src/rootdir/site.webmanifest", to: "." },
        // { from: "src/rootdir/sitemap.xml", to: "." },
        { from: "src/rootdir/robots.txt", to: "." },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "styles/[name].css", // output CSS file name
    }),
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/js/components"),
      "@framework": path.resolve(__dirname, "src/js/framework"),
      //"@data": path.resolve(__dirname, "src/data"),
      //"@lapmonitor": path.resolve(__dirname, "src/lapmonitor"),
      //"@jdbpages": path.resolve(__dirname, "src/data/pages"),
      //"@siteliveurl": "https://www.gmfc.uk/",
    },
    extensions: [".ts", ".js", ".json"], // optional, helps omit extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        mimetype: "image/svg+xml",
        scheme: "data",
        type: "asset/resource",
        generator: {
          filename: "icons/[hash].svg",
        },
      },
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
    ],
  },
};
