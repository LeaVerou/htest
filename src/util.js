

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {*} o - Value to check
 * @returns {string}
 */
export function getType (o) {
	let str = Object.prototype.toString.call(o);

	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}

export function idify (readable) {
	return ((readable || "") + "")
		.replace(/\s+/g, "-") // Convert whitespace to hyphens
		.replace(/[^\w-]/g, "") // Remove weird characters
		.toLowerCase();
};

export function delay (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function toPrecision (number, significantDigits) {
	let n = getType(number) === "number" ? number : parseFloat(number);

	if (Number.isNaN(n)) {
		// 🤷🏽‍♀️
		return number;
	}

	return Math.abs(n) > 1 ? n : n.toPrecision(significantDigits);
}

export function formatDuration (ms) {
	var unit = "ms";

	ms = +ms.toFixed(2);

	if (ms > 100) {
		ms = Math.round(ms);
	}

	if (ms > 1000) {
		ms /= 1000;
		unit = "s";
	}

	return ms + unit;
}

/**
 * Escape a string so it can be used literally in regular expressions
 * @param {string} str
 * @returns {string}
 */
export function regexEscape (str) {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}