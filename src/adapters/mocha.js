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
				before(async function () {
					return await test.beforeAll.apply(test);
				});
			}

			if (test.afterAll) {
				after(async function () {
					return await test.afterAll.apply(test);
				});
			}

			// FIXME: What if more than one test has the same name?
			if (test.beforeEach) {
				beforeEach(async function () {
					let currentTest = test.tests.find(t => t.name === this.currentTest.title);
					return await test.beforeEach.apply(currentTest);
				});
			}

			if (test.afterEach) {
				afterEach(async function () {
					let currentTest = test.tests.find(t => t.name === this.currentTest.title);
					return await test.afterEach.apply(currentTest);
				});
			}

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
				let { rejects, doesNotReject } = await import("assert");
				let run = async () => await test.run.apply(test, test.args);

				if (test.throws === true) {
					await rejects(run);
				}
				else if (test.throws === false) {
					await doesNotReject(run);
				}
				else if (test.throws.prototype instanceof Error) {
					await rejects(run, test.throws);
				}
				else if (typeof test.throws === "function") {
					await rejects(run, test.throws);
				}
			}
			else if (test.maxTime || test.maxTimeAsync) {
				// Time-based test
				let { ok } = await import("assert");

				let start = performance.now();
				let actual = test.run.apply(test, test.args);
				let timeTaken = performance.now() - start;

				let timeTakenAsync;
				if (actual instanceof Promise) {
					actual = await actual;
					timeTakenAsync = performance.now() - start;
				}

				if (test.maxTime) {
					ok(timeTaken <= test.maxTime, `Exceeded max time of ${ test.maxTime }ms (took ${ timeTaken }ms)`);
				}
				else {
					ok(timeTakenAsync <= test.maxTimeAsync, `Exceeded max async time of ${ test.maxTimeAsync }ms (took ${ timeTakenAsync }ms)`);
				}
			}
			else {
				// Result-based test
				let { ok, equal, deepEqual, deepStrictEqual, strictEqual } = await import("assert");
				let actual = await test.run.apply(test, test.args);
				let assertFn;

				if (test.originalCheck) {
					let check = test.originalCheck;
					if (typeof check === "function") {
						let result = await check.call(test, actual, test.expect);
						return ok(result);
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

				assertFn(actual, test.expect);
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
