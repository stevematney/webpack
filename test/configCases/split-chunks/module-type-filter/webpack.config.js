module.exports = {
	entry: {
		main: "./index"
	},
	target: "web",
	output: {
		filename: "[name].js"
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				json: {
					name: "json",
					moduleType: "json",
					chunks: "all",
					enforce: true
				}
			}
		}
	}
};
