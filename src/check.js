import { getType } from "./util.js";

/**
 * Combine multiple checks, requiring a test to pass all of them to pass
 * @param  {...function} fns
 * @returns {function}
 */
export function and (...fns) {
	return function (...args) {
		return fns.every(fn => fn(...args));
	}
}

/**
 * Combine multiple checks, requiring a test to pass any of them to pass
 * @param  {...function} fns
 * @returns {function}
 */
export function or (...fns) {
	return function (...args) {
		return fns.some(fn => fn(...args));
	}
}

/**
 * Check value type
 * @param {string} type
 * @returns {function}
 */
export function is (type) {
	type = type.toLowerCase();

	return function (actual) {
		return getType(actual) === type;
	}
}

/**
 * Apply a checking function recursively to objects and collections
 * @param {function} [check] Function to apply to compare primitive values
 * @returns {function}
 */
export function deep (check = (a, b) => a === b) {
	let callee = function(actual, expect) {
		if (check.call(this, actual, expect)) {
			return true;
		}

		if (typeof expect !== "object") {
			// If not an object, it's definitely not a container object,
			// and we know it doesn't pass, so we can fail early.
			return false;
		}

		if (Array.isArray(expect)) {
			if (!Array.isArray(actual) || actual.length !== expect.length) {
				return false;
			}

			return expect.every((ref, i) => callee.call(this, actual[i], ref));
		}

		let type = getType(expect);

		if (expect?.[Symbol.iterator]) {
			// Iterable collection (Array, Set, Map, NodeList, etc.)
			if (getType(actual) !== type) {
				return false;
			}

			return callee.call(this, [...actual], [...expect]);
		}

		// Compare objects recursively
		if (type === "object") {
			let propertyUnion = new Set([...Object.keys(expect), ...Object.keys(actual)]);
			return [...propertyUnion].every(key => callee(actual[key], expect[key]));
		}

		return false;
	}
	return callee;
};

/**
 * Compare by equality, but also compare objects and arrays recursively
 * @param {*} expect
 * @param {*} actual
 * @returns {boolean}
 */
export const equals = deep(function (actual, expect) {
	return expect === actual || (getType(expect) === getType(actual) && expect == actual);
});

/**
 * Compare numbers or lists of numbers with an optional epsilon
 * @param {number} [ε=0]
 * @returns {function(actual, expect): boolean}
 */
export function proximity(o = {}) {
	return function (actual, expect) {
		if (Number.isNaN(expect)) {
			return Number.isNaN(actual);
		}
		else if (expect === null) {
			return actual === null;
		}
		else {
			let {epsilon = 0} = o;
			return Math.abs(expect - actual) <= epsilon;
		}
	};
}

export function between({min, max}) {
	return function (actual) {
		return min <= actual && actual <= max;
	}
}