/**
 * @packageDocumentation
 * This is hTest’s assertion library (but you can use any other)
 * Most functions generate assertion functions based on the parameters you specify.
 */
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
 * @param {function} [check] Function to apply to compare primitive values. Defaults to strict equality
 * @returns {function(actual, expect): boolean}
 */
export function deep (check = (a, b) => a === b) {
	let callee = function (actual, expect) {
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
		let actualtype = getType(actual);

		if (expect?.[Symbol.iterator]) {
			// Iterable collection (Array, Set, Map, NodeList, etc.)
			if (actualtype !== type) {
				return false;
			}

			return callee.call(this, [...actual], [...expect]);
		}

		// Compare objects recursively
		if (type === "object") {
			if (actualtype !== type) {
				return false;
			}

			let propertyUnion = new Set([...Object.keys(expect), ...Object.keys(actual)]);
			return [...propertyUnion].every(key => callee(actual[key], expect[key]));
		}

		return false;
	}

	callee.shallow = check;

	return callee;
};

/**
 * Compare by equality. Slighly more permissive than `===`: it uses `===` first, but falls back to `==` plus a type check if that fails.
 * Deep by default, use `equals.shallow` for shallow comparison.
 * @param {*} expect
 * @param {*} actual
 * @returns {boolean}
 */
export const equals = deep(function (actual, expect) {
	return expect === actual || (getType(expect) === getType(actual) && expect == actual);
});

/**
 * Compare numbers or lists of numbers with a margin of error
 * @param {object} [options] Options object
 * @param {number} [o.epsilon = 0] Epsilon for comparison
 * @returns {function(actual, expect): boolean}
 */
export function proximity (options = {}) {
	return function (actual, expect) {
		if (Number.isNaN(expect)) {
			return Number.isNaN(actual);
		}
		else if (expect === null) {
			return actual === null;
		}
		else {
			let {epsilon = 0} = options;
			return Math.abs(expect - actual) <= epsilon;
		}
	};
}

/**
 * Check that numbers (or lists of numbers) are within certain upper and/or lower bounds
 * @param {object} [options]
 * @param {number} options.gt
 * @param {number} options.gte
 * @param {number} options.lt
 * @param {number} options.lte
 * @param {number} options.from Alias of `options.lt`
 * @param {number} options.max Alias of `options.lte`
 * @param {number} options.to Alias of `options.gt`
 * @param {number} options.min Alias of `options.gte`
 * @returns {function(actual, expect): boolean}
 */
export function range (options = {}) {
	options.lt ??= options.from;
	options.lte ??= option.min;
	options.gt ??= options.to;
	options.gte ??= options.max;

	return function (actual) {
		return (
			(options.lt  === undefined || actual <  options.lt)  &&
			(options.lte === undefined || actual <= options.lte) &&
			(options.gt  === undefined || actual >  options.gt)  &&
			(options.gte === undefined || actual >= options.gte)
		);
	}
}

/**
 * Alias of `range()`
 */
export const between = range