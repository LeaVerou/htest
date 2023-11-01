const markdownIt = require("markdown-it");
const anchor = require('markdown-it-anchor')
const pluginTOC = require('eleventy-plugin-toc');

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
		.use(anchor, {
			permalink: anchor.permalink.headerLink()
		})
	);

	config.addFilter(
		"relative",
		page => {
			let path = page.url.replace(/[^/]+$/, "");
			let ret = require("path").relative(path, "/");

			return ret || ".";
		}
	);

	config.addPlugin(pluginTOC);

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			output: "."
		}
	};
};
