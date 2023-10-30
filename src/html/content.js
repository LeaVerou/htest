export { equals } from "../check.js";

/**
 * Utilities that are useful for tests
 */
const DEFAULT_CONTENT_IGNORE = [".mv-ui", "script", ".test-content-ignore"];
const formContent = {
	"input, textarea": e => e.value,
	"select": e => {
		return [...e.selectedOptions].map(o => o.textContent).join(",\n");
	}
}

export function domContent ({
	hidden = false,
	pseudos = true,
	collapseWhitespace = true,
	ignore = DEFAULT_CONTENT_IGNORE,
	smartForms = true
} = {}) {
	let callee = function(node) {
		var ret = "";

		if (node.nodeType == 1) {
			if (!hidden && getComputedStyle(node).display == "none") {
				return "";
			}

			if (pseudos) {
				ret += pseudo(node, "before");
			}

			if (node.matches(ignore.join(", "))) {
				return "";
			}

			let formRule = smartForms ? Object.entries(formContent).find(([selector, rule]) => node.closest(selector))?.map(([selector, rule]) => rule) : null;

			if (formRule) {
				ret += formRule(node);
			}
			else {
				ret += [...node.childNodes].map(callee).join("");
			}

			if (pseudos) {
				ret += pseudo(node, "after");
			}

		}
		else if (node.nodeType == 3) {
			ret += node.textContent;
		}

		return collapseWhitespace ? ret.replace(/\s+/g, " ") : ret;
	}
	return callee;
}

export const content = domContent();

function pseudo (element, pseudo) {
	var content = getComputedStyle(element, ":" + pseudo).content;

	if (content == "none") {
		return "";
	}

	return content.replace(/^["']|["']$/g, "");
}