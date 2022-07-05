/**
 * Built-in comparison functions
 */

import { parseClick, create, $$, bind, ready, delay } from "./util.js";
import { content } from "./content.js";
import hooks from "./hooks.js";


export function contents (...cells) {
	var td = cells[cells.length - 2] || cells[cells.length - 1];
	var ref = cells[cells.length - 1];

	var pass = content(td).trim() == content(ref).trim();

	return pass;
}

/**
 * Compare numbers ignoring other stuff around them optionally with epsilon
 */
export function numbers (...cells) {
	let tr = cells[0].parentNode;
	let ε = +(tr.closest("[data-epsilon]")?.dataset.epsilon) || 0;

	let test = cells[cells.length - 2] || cells[cells.length - 1];
	let ref = cells[cells.length - 1];

	let rNumber = /-?\d*\.?\d+(?:e-?\d+)?|NaN/g;

	let test_numbers = content(test).match(rNumber) || [];
	let ref_numbers = content(ref).match(rNumber) || [];

	if (test_numbers.length !== ref_numbers.length) {
		// Different number of numbers
		return false;
	}

	for (let i = 0; i < test_numbers.length; i++) {
		let test = test_numbers[i];
		let ref = ref_numbers[i];

		if (Number.isNaN(ref) && !Number.isNaN(test)) {
			return false;
		}

		if (Math.abs(test - ref) > ε) {
			return false;
		}
	}

	return true;
}

export function attribute (attribute, td, ref) {
	var actual = $$("*", td).map(el => el[attribute]);
	var expected = $$("*", ref).map(el => el[attribute]);

	return actual.length === expected.length && actual.every((v, i) => {
		return v === expected[i];

	});
}

/**
 * Pass or fail when the test matches or doesn't match a given selector
 * @param {*} td
 * @param {*} ref
 * @returns
 */
export function selector (td, ref) {
	if (ref.children.length) {
		// Multiple selectors to test against in a list
		return $$("li", ref).every(li => selector(td, li));
	}
	else {
		var negative = ref.classList.contains("not");
		var has = !!$(ref.textContent, td);
		return negative? !has : has;
	}
}

/**
 * Compare the DOM structure of two elements (compares both content and attributes)
 * Previously called `elements`
 */
export function dom (td, ref) {
	var elements = $$("*", td);

	return $$("*", ref).every((refElement, i) => {
		var element = elements[i];

		return element.nodeName == refElement.nodeName
				&& $$(refElement.attributes).every(attr => element.getAttribute(attr.name) === attr.value)
				&& content(element).trim() == content(refElement).trim();
	});
}