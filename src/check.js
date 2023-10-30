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
export function closeEnough ({epsilon = 0} = {}) {
	let ret = function(actual, expect) {
		if (Array.isArray(actual) && Array.isArray(expect)) {
			if (actual.length !== expect.length) {
				// One has more numbers than the other
				return false;
			}

			return expect.every((ref, i) => ret(actual[i], ref));
		}

		return Number.isNaN(expect) === Number.isNaN(actual)
		       && Math.abs(expect - actual) <= epsilon;
	}
	return ret;
}

export function between({min, max}) {
	return function (actual) {
		return min <= actual && actual <= max;
	}
}