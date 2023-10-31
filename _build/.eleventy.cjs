let markdownIt = require("markdown-it");

module.exports = config => {
	let data = {
		"layout": "page.njk",
		"permalink": "{{ page.filePathStem | replace('README', '') }}/index.html"
	};

	for (let p in data) {
		config.addGlobalData(p, data[p]);
	}

	config.setDataDeepMerge(true);

	config.setLibrary("md", markdownIt({
			html: true,
		})
		.disable("code")
	);

	config.addFilter(
		"relative",
		page => {
			let path = page.url.replace(/[^/]+$/, "");
			let ret = require("path").relative(path, "/");

			return ret || ".";
		}
	);

	config.addFilter(
		"unslugify",
		slug => slug.replace(/(^|-)([a-z])/g, ($0, $1, $2) => ($1? " " : "") + $2.toUpperCase())
	);

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			output: "."
		}
	};
};
