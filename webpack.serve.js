"use strict";
const path = require("path");

module.exports = {
  mode: "development",
  entry: {},
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    hot: false,
    historyApiFallback: {
      index: "/404.html",
      rewrites: [
        { from: /^\/news\/?$/, to: "/news.html" },
        {
          from: /^(?!.*\.\w+$).*/,
          to: (ctx) => `${ctx.parsedUrl.pathname.replace(/\/$/, "")}.html`,
        },
      ],
    },
  },
  plugins: [],
};