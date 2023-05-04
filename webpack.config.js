const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const pages = ["MainPage", "SecondPage"];

module.exports = (env) => {
	const isProduction = !!env.WEBPACK_BUILD;
	return {
		mode: isProduction ? "production" : "development",
		entry: pages.reduce((config, page) => {
			config[page] = `./src/pages/${page}/index.js`;
			return config;
		}, {}),
		devtool: isProduction ? false : "inline-source-map",
		devServer: {
			static: ["dist", "src/"],
			watchFiles: ["src/**/*.*"],
		},
		plugins: [].concat(
			pages.map(
				(page) =>
					new HtmlWebpackPlugin({
						inject: true,
						template: `./src/pages/${page}/index.html`,
						filename: `./src/pages/${page}/index.html`,
						chunks: [page],
					})
			)
		),
		output: {
			filename: "[name].js",
			path: path.resolve(__dirname, "dist"),
			publicPath: "/",
		},
	};
};
