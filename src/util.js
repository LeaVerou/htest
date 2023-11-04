import * as objects from "./objects.js";

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {*} value - Value to check
 * @returns {string}
 */
export function getType (value, { preserveCase = false } = {}) {
	let str = Object.prototype.toString.call(value);

	let ret = (str.match(/^\[object\s+(.*?)\]$/)[1] || "");

	if (!preserveCase) {
		ret = ret.toLowerCase();
	}

	return ret;
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

let durations = [
	{ unit: "ms", from: 0 },
	{ unit: "s", from: 1000 },
	{ unit: "m", from: 60 },
	{ unit: "h", from: 60 },
	{ unit: "d", from: 24 },
	{ unit: "w", from: 7 },
	{ unit: "y", from: 52 },
];

export function formatDuration (ms) {
	if (!ms) {
		return "0 ms";
	}

	let unit = "ms";
	let n = ms;

	for (let i = 0; i < durations.length; i++) {
		let next = durations[i + 1];

		if (next && n >= next.from) {
			n /= next.from;
			unit = next.unit;
		}
		else {
			if (n < 10) {
				n = toPrecision(+n, 1);
			}
			else if (n < next.from) {
				n = Math.round(n);
			}

			break;
		}
	}

	return n + " " + unit;
}

/**
 * Escape a string so it can be used literally in regular expressions
 * @param {string} str
 * @returns {string}
 */
export function regexEscape (str) {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Stringify object in a useful way
 */
export function stringify (obj) {
	return objects.stringify(obj, (obj, level) => {
		switch(typeof obj) {
			case "symbol":
				return `Symbol(${obj.description})`;
			case "function":
				return obj.toString();
		}

		let type = getType(obj, { preserveCase: true });

		if (!(typeof obj === "object") || !obj || Array.isArray(obj)) {
			return;
		}

		let indent = "\t".repeat(level);

		if (obj?.[Symbol.iterator] && !["String", "Array"].includes(type)) {
			return `${type}(${ obj.length ?? obj.size }) ` + objects.join(obj, ", ", {
				indent,
				map: o => stringify(o),
			 });
		}
		else if (globalThis.HTMLElement && obj instanceof HTMLElement) {
			return obj.outerHTML;
		}

		let toString = obj + "";

		if (!/\[object \w+/.test(toString)) {
			// Has reasonable toString method, return that
			return toString;
		}
	});


};