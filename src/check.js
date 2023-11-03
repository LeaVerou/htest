import { getType } from "./util.js";

export function and (...fns) {
	return function (...args) {
		return fns.every(fn => fn(...args));
	}
}

export function or (...fns) {
	return function (...args) {
		return fns.some(fn => fn(...args));
	}
}

export function is (type) {
	type = type.toLowerCase();

	return function (actual) {
		return getType(actual) === type;
	}
}

/**
 * Compare by equality, but also compare objects and arrays recursively
 * @param {*} expect
 * @param {*} actual
 * @returns {boolean}
 */
export function equals (actual, expect) {
	if (expect === actual) {
		return true;
	}

	let type = getType(expect);

	if (type === getType(actual)) {
		if (expect == actual) {
			return true;
		}

		if (Array.isArray(expect) && Array.isArray(actual)) {
			return expect.length === actual.length && expect.reduce((prev, current, i) => prev && equals(current, actual[i]), true);
		}

		if (type == "object") {
			// Compare objects recursively
			let propertyUnion = new Set([...Object.keys(expect), ...Object.keys(actual)]);
			return [...propertyUnion].reduce((prev, current) => prev && equals(expect[current], actual[current]), true);
		}
	}

	return false;
};

/**
 * Compare numbers or lists of numbers with an optional epsilon
 * @param {number} [ε=0]
 * @returns {function(actual, expect): boolean}
 */
export function proximity (o = {}) {
	let callee = function proximity (actual, expect) {
		if (Array.isArray(expect)) {
			if (!Array.isArray(actual) || actual.length !== expect.length) {
				return false;
			}

			return expect.every((ref, i) => callee(actual[i], ref));
		}

		let {epsilon = 0} = o;

		if (Number.isNaN(expect)) {
			return Number.isNaN(actual);
		}
		else if (expect === null) {
			return actual === null;
		}
		else {
			return Math.abs(expect - actual) <= epsilon;
		}
	}
	return callee;
}

export function between({min, max}) {
	return function (actual) {
		return min <= actual && actual <= max;
	}
}