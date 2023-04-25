const path = require("path");

module.exports = {
  entry: "./frontend/public/js/main.js",
  output: {
    path: path.join(__dirname, "backend", "src", "public", "static", "scripts"),
    publicPath: "/static/scripts",
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
