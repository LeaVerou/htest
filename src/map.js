import { getType } from "./util.js";

/**
 * Extract lists of numbers from a value
 * @param {*} value
 * @returns
 */
export function numbersOnly (value) {
	let type = getType(value);
	let rNumber = /-?\d*\.?\d+(?:e-?\d+)?|NaN/g;

	if (type === "string") {
		return value.match(rNumber) ?? [];
	}
	else if (type === "number") {
		return [value]
	}
	else if (Array.isArray(value)) {
		return value.map(n => numbersOnly(n));
	}
	else {
		return [];
	}
}

export function trimmed (value) {
	return (value + "").trim();
}