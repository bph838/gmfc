"use strict";

const path = require("path");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const ProcessWebsiteStaticPages = require("./webpack/ProcessWebsiteStaticPages");

module.exports = {
  mode: "development",
  entry: "./src/js/main.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new miniCssExtractPlugin(),
    new ProcessWebsiteStaticPages("./src/database/pages_static.json"),
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
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/js/components"),
      //"@framework": path.resolve(__dirname, "src/js/framework"),
      //"@data": path.resolve(__dirname, "src/data"),
      //"@lapmonitor": path.resolve(__dirname, "src/lapmonitor"),
      //"@jdbpages": path.resolve(__dirname, "src/data/pages"),
      //"@siteliveurl": "https://www.gmfc.uk/",
    },
    extensions: [".js", ".json"], // optional, helps omit extensions
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
        test: /\.(scss)$/,
        use: [
          {
            // Extracts CSS for each JS file that includes CSS
            loader: miniCssExtractPlugin.loader,
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: "css-loader",
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [autoprefixer],
              },
            },
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: "sass-loader",
            options: {
              sassOptions: {
                silenceDeprecations: [
                  "color-functions",
                  "global-builtin",
                  "import",
                  "if-function",
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
