const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";
  const mode = isEnvProduction ? "production" : isEnvDevelopment && "development";

  const pathConfig = {
    entry: "./src/index",
    output: {
      path: path.join(__dirname, "/dist"),
      filename: "[name].js",
      assetModuleFilename: "images/[hash][ext][query]",
      publicPath: "/",
    },
  };

  const devConfig = {
    devtool: isEnvDevelopment ? "hidden-source-map" : "eval",
    devServer: {
      host: "localhost",
      port: 3300,
      historyApiFallback: true,
    },
  };

  const resolve = {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {},
  };

  const module = {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: /\.(png|jpg|svg)$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  };

  const plugins = [
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      minify: isEnvProduction
        ? {
            collapseWhitespace: true, // 빈칸 제거
            removeComments: true, // 주석 제거
          }
        : false,
    }),

    new CleanWebpackPlugin(),
  ];

  return {
    ...pathConfig,
    ...devConfig,
    mode,
    resolve,
    module,
    plugins,
  };
};
