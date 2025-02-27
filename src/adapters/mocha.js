/**
 * Adapter to run hTest tests using Mocha's test runner.
 * This adapter transforms hTest's test structure into Mocha's describe/it format.
 */

import Test from "../classes/Test.js";

/**
 * Transforms an hTest test into a Mocha test
 * @param {object} test - The test to transform
 */
export default function transform (test) {
	if (!(test instanceof Test)) {
		test = preserveProperties(test);
		test = new Test(test);
	}

	if (test.isGroup) {
		// Use describe.skip() for skipped test groups
		let describeFn = test.skip ? describe.skip : describe;
		describeFn(test.description || test.name, () => {
			if (test.beforeAll) {
				before(test.beforeAll.bind(test));
			}

			if (test.afterAll) {
				after(test.afterAll.bind(test));
			}

			// FIXME: We need to pass the right context to beforeEach/afterEach (for now, we pass a group of tests instead of a single one)
			// if (test.beforeEach) {
			// 	beforeEach(test.beforeEach.bind(test));
			// }

			// if (test.afterEach) {
			// 	afterEach(test.afterEach.bind(test));
			// }

			test.tests.forEach(test => transform(test));
		});
	}
	else {
		// Use it.skip() for skipped tests
		let itFn = test.skip ? it.skip : it;

		// Create a Mocha test with the assertion logic
		itFn(test.name, async () => {
			if (test.throws !== undefined) {
				// Error-based test
				let { throws, doesNotThrow } = await import("assert");
				let run = test.run.bind(test, ...test.args);

				if (test.throws === true) {
					await throws(run);
				}
				else if (test.throws === false) {
					await doesNotThrow(run);
				}
				else if (test.throws.prototype instanceof Error) {
					await throws(run, test.throws);
				}
				else if (typeof test.throws === "function") {
					await throws(run, test.throws);
				}
			}
			else {
				// Result-based test
				let { ok, equal, deepEqual, deepStrictEqual, strictEqual } = await import("assert");
				let actual = test.run.apply(test, test.args);
				let assertFn;

				if (test.originalCheck) {
					let check = test.originalCheck;
					if (typeof check === "function") {
						return await ok(check.call(test, actual, test.expect));
					}
					else {
						if (check.looseTypes) {
							if (check.deep) {
								assertFn = deepEqual;
							}
							else {
								assertFn = equal;
							}
						}
						else if (check.deep) {
							assertFn = deepStrictEqual;
						}
						else {
							assertFn = strictEqual;
						}
					}
				}
				else {
					assertFn = deepStrictEqual;
				}

				await assertFn(actual, test.expect);
			}
		});
	}
}

function preserveProperties (test, properties = ["check"]) {
	for (let prop of properties) {
		if (prop in test) {
			let name = "original" + prop.charAt(0).toUpperCase() + prop.slice(1);
			test[name] = test[prop];
		}
	}

	if (test.tests?.length) {
		test.tests.forEach(t => preserveProperties(t, properties));
	}

	return test;
}
