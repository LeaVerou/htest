export default {
	// Extract default title from content
	title (data) {
		if (data.title) {
			return data.title;
		}

		let ext = data.page.inputPath.split(".").pop();

		// Title must appear in first 1000 chars
		let content = data.page.rawInput.slice(0, 1000);

		if (ext === "md") {
			// First heading
			return content.match(/^#+\s+(.*)/m)?.[1];
		}
		else if (ext === "njk") {
			// First level 1 heading
			return content.match(/<h1>(.*)<\/h1>/)?.[1];
		}
	},
	eleventyNavigation: {
		key: data => data.navKey ?? data.page.url,
		title: data => data.nav ?? data.title,
		parent: data => {
			if (data.parent) {
				return data.parent;
			}

			let parts = data.page.url.split("/");
			let i = parts.findLastIndex((part, i) => part);
			parts.splice(i, 1);
			return parts.join("/");
		},
		order: data => data.order,
		url: data => data.url ?? data.page.url,
	},
	allData (data) {
		return data;
	},
}