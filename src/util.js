export {default as create} from "https://v2.blissfuljs.com/src/dom/create.js";
export {default as bind} from "https://v2.blissfuljs.com/src/events/bind.js";
export {default as include} from "https://v2.blissfuljs.com/src/async/include.js";

/**
 * Parse data-click text into a meaningful structure
 * Examples:
	 .mv-bar .mv-save wait 5s after load"
	.mv-bar .mv-save wait 3s" (no event, DOMContentLoaded assumed)
	wait 1s after load" (no selector, element assumed)
	*/
export function parseClick (click) {
	var ret = {times: 1};

	click = click.replace(/wait ([\d.]+)s/i, ($0, $1) => {
		ret.delay = $1 * 1000;
		return "";
	});

	click = click.replace(/after ([\w:-]+)\s*$/i, ($0, $1) => {
		ret.event = $1;
		return "";
	});

	click = click.replace(/(\d+) times/i, ($0, $1) => {
		ret.times = $1;
		return "";
	});

	ret.selector = click.trim();

	return ret;
}

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {*} o - Value to check
 * @returns {string}
 */
export function getType (o) {
	let str = Object.prototype.toString.call(o);

	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}

export function pseudo (element, pseudo) {
	var content = getComputedStyle(element, ":" + pseudo).content;

	if (content == "none") {
		return "";
	}

	return content.replace(/^["']|["']$/g, "");
}

export function idify (readable) {
	return ((readable || "") + "")
		.replace(/\s+/g, "-") // Convert whitespace to hyphens
		.replace(/[^\w-]/g, "") // Remove weird characters
		.toLowerCase();
};

export function $$(selector, context = document) {
	return [...context.querySelectorAll(selector)];
}

export function ready (doc = document) {
	return new Promise(resolve => {
		if (doc.readyState !== "loading") {
			resolve();
		}
		else {
			doc.addEventListener("DOMContentLoaded", resolve, {once: true});
		}
	});
}

export function delay (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}