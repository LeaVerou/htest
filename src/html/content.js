import { structuredEquals } from "../compare.js";
/**
 * Utilities that are useful for tests
 */

export function content (node) {
	var ret = "";

	if (node.nodeType == 1) {
		if (getComputedStyle(node).display == "none") {
			return "";
		}

		ret += pseudo(node, "before");
		var special = false;

		if (node.matches(contentRules.ignore.join(", "))) {
			return "";
		}

		for (let selector in contentRules.read) {
			if (node.matches(selector)) {
				ret += contentRules.read[selector](node);
				special = true;
				break;
			}
		}

		if (!special) {
			for (let child of node.childNodes) {
				ret += content(child);
			}
		}

		ret += pseudo(node, "after");
	}
	else if (node.nodeType == 3) {
		ret += node.textContent;
	}

	return ret.replace(/\s+/g, " ");
}

export const contentRules = {
	"read": {
		"input, textarea": e => e.value,
		"select": e => {
			return [...e.selectedOptions].map(o => o.textContent).join("\n");
		}
	},
	"ignore": [".mv-ui", "script", ".test-content-ignore"]
};

export function pseudo (element, pseudo) {
	var content = getComputedStyle(element, ":" + pseudo).content;

	if (content == "none") {
		return "";
	}

	return content.replace(/^["']|["']$/g, "");
}

export function equals(a, b) {
	console.warn("equals() has moved to src/compare.js and is now structuredEquals()");
	return structuredEquals(a, b);
}