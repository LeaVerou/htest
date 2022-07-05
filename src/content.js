import {pseudo, getType} from "./util.js";

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

export function equals (a, b) {
	if (a === b) {
		return true;
	}

	let type = getType(a);

	if (type == getType(b)) {
		if (a == b) {
			return true;
		}

		if (Array.isArray(a) && Array.isArray(b)) {
			return a.length === b.length && a.reduce((prev, current, i) => prev && equals(current, b[i]), true);
		}

		if (type == "object") {
			var test = Object.assign({}, a, Object.keys(b));
			return JSON.stringify(test) == JSON.stringify(b);
		}
	}

	return false;
};