const path = require("path");

module.exports = {
  entry: "./public/js/main.js",
  output: {
    path: path.join(__dirname, "public", "scripts"),
    publicPath: "../backend/src/public/static/scripts",
    filename: "bundle.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
    ],
  },
};