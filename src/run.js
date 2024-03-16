/**
 * Environment agnostic function for running one or more tests.
 */

import Test from "./classes/Test.js";
import TestResult from "./classes/TestResult.js";
import { getType, subsetTests } from './util.js';



/**
 * Run a test or group of tests in Node.js
 * @param {Test | object} test
 * @param {object} [options]
 * @param {"rich" | "plain"} [options.format] Format to use for output. Defaults to "rich"
 */
export default function run (test, options = {}) {
	if (Array.isArray(test)) {
		if (test.length === 1) {
			test = test[0];
		}
		else {
			return run ({tests: test}, options);
		}
	}

	if (options.path) {
		subsetTests(test, options.path);
	}

	if (!(test instanceof Test)) {
		test = new Test(test, null, options);
	}

	let ret = new TestResult(test, null, options);

	ret.addEventListener("done", e => {
		options.env.done(ret, options);
	});

	return ret.runAll();
}
