export const formats = {};

/**
 * Platform agnostic console formatting
 * @param {*} str
 * @param {*} format
 */
export default function format (str, format) {
	if (typeof format === "string") {
		format = Object.fromEntries(format.split(/\s+/).map(type => [type, true]));
	}

	for (let type in format) {
		str = formats[type] ? formats[type](str) : str;
	}

	return str;
}