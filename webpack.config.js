const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  // Get the repository name from package.json for GitHub Pages deployment
  const packageJson = require("./package.json");
  const repoName = packageJson.homepage.split("/").pop();

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: isProduction ? `/${repoName}/` : "/",
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        templateParameters: {
          analyticsScript: process.env.GA_MEASUREMENT_ID
            ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${process.env.GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.GA_MEASUREMENT_ID}');
    </script>`
            : "",
        },
        minify: isProduction,
        inject: "body",
      }),
      new Dotenv({
        systemvars: isProduction, // Use system environment variables in production
      }),
      new CopyPlugin({
        patterns: [
          { from: "public", to: "" }, // Copy static assets
          { from: "src/service-worker.js", to: "service-worker.js" },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    performance: {
      hints: isProduction ? "warning" : false,
    },
  };
};
