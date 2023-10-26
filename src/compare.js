import { getType } from "./util.js";

/**
 * Compare by equality, but also compare objects and arrays recursively
 * @param {*} ref
 * @param {*} test
 * @returns {boolean}
 */
export function structuredEquals (ref, test) {
	if (ref === test) {
		return true;
	}

	let type = getType(ref);

	if (type === getType(test)) {
		if (ref == test) {
			return true;
		}

		if (Array.isArray(ref) && Array.isArray(test)) {
			return ref.length === test.length && ref.reduce((prev, current, i) => prev && equals(current, test[i]), true);
		}

		if (type == "object") {
			// Compare objects recursively
			let propertyUnion = new Set([...Object.keys(ref), ...Object.keys(test)]);
			return [...propertyUnion].reduce((prev, current) => prev && equals(ref[current], test[current]), true);
		}
	}

	return false;
};

/**
 * Compare two numbers with an optional epsilon
 * @param  {number} [ε=0]
 * @param {number} ref
 * @param {*} test
 * @returns {boolean}
 */
export function numeric (...args) {
	let ε = args.length === 3? args.shift() : 0;
	let [ref, test] = args;

	return Number.isNaN(ref) === Number.isNaN(test)
	       && Math.abs(ref - test) <= ε;
}

/**
 * Compare lists of multiple numbers with an optional epsilon
 * @param  {number} [ε=0]
 * @param {number[] | string} ref
 * @param {number[] | string} test
 * @returns {boolean}
 */
export function numbers (...args) {
	let ε = args.length === 3? args.shift() : 0;
	let [ref, test] = args;

	function getNumbers(value) {
		let type = getType(value);
		let rNumber = /-?\d*\.?\d+(?:e-?\d+)?|NaN/g;

		if (type === "string") {
			return value.match(rNumber) ?? [];
		}
		else if (type === "number") {
			return [value]
		}
		else if (Array.isArray(value)) {
			return value.map(n => +n);
		}
		else {
			return [];
		}
	}

	ref = getNumbers(ref);
	test = getNumbers(test);

	if (test.length !== ref.length) {
		// One has more numbers than the other
		return false;
	}

	return ref.every((ref, i) => numeric(ε, ref, test[i]));
}