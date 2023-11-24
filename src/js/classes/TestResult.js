import BubblingEventTarget from "./BubblingEventTarget.js";
import format, { stripFormatting } from "../format-console.js";
import { delay, formatDuration, stringify } from "../../util.js";

export default class TestResult extends BubblingEventTarget {
	pass;
	details = [];
	timeTaken = 0;
	stats = {};

	/**
	 *
	 * @param {object} test
	 * @param {object} [parent = null]
	 * @param {object} [options]
	 * @param {string | string[] | number | number[]} [options.only] Only run a subset of tests
	 *        If one or more numbers, or a string that begins with a number, it is a path to a test/group
	 *        If one or more identifiers, it will only run tests with that id, regardless of nesting
	 *        If mixed, it will follow the numbers as a path, then will not consume any more numbers until it finds the id.
	 * @param {boolean} [options.verbose] Show all tests, not just failed ones
	 */
	constructor(test, parent, options = {}) {
		super();

		this.test = test;
		this.parent = parent ?? null;
		this.options = options;

		if (this.options.only) {
			this.options.only = Array.isArray(this.options.only) ? this.options.only : [this.options.only];
		}

		this.addEventListener("done", e => {
			let originalTarget = e.detail?.target ?? e.target;

			if (originalTarget.test.isTest) {
				if (originalTarget.pass) {
					this.stats.pass++;
				}
				else {
					this.stats.fail++;
				}

				this.timeTaken += originalTarget.timeTaken;

				if (originalTarget.timeTakenAsync) {
					this.timeTakenAsync ??= 0;
					this.timeTakenAsync += originalTarget.timeTakenAsync;
				}

				this.stats.pending--;

				if (this.stats.pending <= 0) {
					this.dispatchEvent(new Event("finish"));
				}
			}
		});
	}

	get name () {
		return this.test.name;
	}

	warn (msg) {
		return Test.prototype.warn.call(this, msg);
	}

	async run () {
		let start = performance.now();

		try {
			this.actual = this.test.run.apply(this.test, this.test.args);
			this.timeTaken = performance.now() - start;

			if (this.actual instanceof Promise) {
				this.actual = await this.actual;
				this.timeTakenAsync = performance.now() - start;
			}
		}
		catch (e) {
			this.error = e;
		}

		this.evaluate();
	}

	runAll () {
		this.stats = {
			pass: 0, fail: 0, error: 0,
			total: this.test.testCount,
			totalTime: 0,
			totalTimeAsync: 0,
		};

		this.stats.pending = this.stats.total;
		this.finished = new Promise(resolve => this.addEventListener("finish", resolve, {once: true}));

		let tests = this.test.tests;

		let childOptions = Object.assign({}, this.options);

		if (this.options.only) {
			childOptions.only = childOptions.only.slice();
			let first = childOptions.only[0];
			if (/^\d/.test(first)) { // Path
				// TODO ranges (e.g. "0-5")
				tests = [tests[first]];
				childOptions.only.unshift();
			}
			else {
				// Id
				let test = tests.fimd(t => t.id === first);

				if (test) {
					tests = [test];
					// We only remove the id if found, since otherwise it may be found in a descendant
					childOptions.only.unshift();
				}
			}
		}

		this.tests = this.test.tests?.map(t => new TestResult(t, this, childOptions));

		delay(1).then(() => {
			if (this.test.isTest) {
				this.run();
			}

			this.tests?.forEach(t => t.runAll());
		});

		return this;
	}

	evaluate () {
		let test = this.test;

		if (test.throws) {
			Object.assign(this, this.evaluateThrown());
		}
		else if (test.maxTime || test.maxTimeAsync) {
			Object.assign(this, this.evaluateTimeTaken());
		}
		else {
			Object.assign(this, this.evaluateResult());
		}

		this.dispatchEvent(new Event("done", {bubbles: true}));
	}

	evaluateThrown () {
		let test = this.test;
		let ret = {pass: !!this.error, details: []};

		// We may have more picky criteria for the error
		if (ret.pass) {
			if (typeof test.throws === "function") {
				ret.pass &&= test.throws(this.error);

				if (!ret.pass) {
					ret.details.push(`Got error ${ this.error }, but didn’t pass test ${ test.throws }`);
				}
			}
			else if (test.throws instanceof Error) {
				// We want a specific subclass, e.g. TypeError
				ret.pass &&= this.error instanceof test.throws;

				if (!ret.pass) {
					ret.details.push(`Got error ${ this.error }, but was not a subclass of ${ test.throws }`);
				}
			}
			else {
				if (!ret.pass) {
					ret.details.push(`Expected error but ${ this.actual !== undefined? ` got ${ stringify(this.actual) }` : "none was thrown" }`);
				}
			}
		}

		return ret;
	}

	evaluateResult () {
		let test = this.test;
		let ret = {pass: true, details: []};

		if (test.map) {
			this.mapped = {
				actual: Array.isArray(this.actual) ? this.actual.map(test.map) : test.map(this.actual),
				expect: Array.isArray(test.expect) ? test.expect.map(test.map) : test.map(test.expect),
			};

			ret.pass = test.check(this.mapped.actual, this.mapped.expect);
		}
		else {
			ret.pass = test.check(this.actual, test.expect);
		}

		if (!ret.pass) {
			if (this.error) {
				ret.details.push(`Got error ${ this.error }
${ this.error.stack }`);
			}
			else {
				let actual = this.mapped?.actual ?? this.actual;

				let message = `Got ${ stringify(actual) }`;

				if (this.mapped && actual !== this.actual) {
					message += ` (${ stringify(this.actual) } unmapped)`;
				}

				if ("expect" in test) {
					let expect = this.mapped?.expect ?? test.expect;
					message += `, expected ${ stringify(expect) }`;

					if (this.mapped && expect !== test.expect) {
						message += ` (${ stringify(test.expect) } unmapped)`;
					}
				}
				else {
					message += "which doesn’t pass the test provided";
				}

				ret.details.push(message);
			}
		}

		return ret;
	}

	evaluateTimeTaken () {
		let test = this.test;
		let ret = {pass: true, details: []};

		if (test.maxTime) {
			ret.pass &&= this.timeTaken <= test.maxTime;

			if (!ret.pass) {
				ret.details.push(`Exceeded max time of ${ test.maxTime }ms (took ${ this.timeTaken }ms)`);
			}
		}

		if (test.maxTimeAsync) {
			ret.pass &&= this.timeTakenAsync <= test.maxTimeAsync;

			if (!ret.pass) {
				ret.details.push(`Exceeded max async time of ${ test.maxTimeAsync }ms (took ${ this.timeTakenAsync }ms)`);
			}
		}
	}

	get isLast () {
		return this.parent.tests[this.parent.tests.length - 1] === this;
	}

	getResult (o) {
		let color = this.pass ? "green" : "red";
		let ret = [
			`<b><bg ${color}><c white> ${ this.pass? "PASS" : "FAIL" } </c></bg></b>`,
			`<c light${color}>${this.name ?? "(Anonymous"}</c>`,
			`<dim>(${ formatDuration(this.timeTaken ?? 0) })</dim>`,
		].join(" ");

		if (this.details?.length > 0) {
			ret += ": " + this.details.join(", ");
		}

		return o?.format === "rich" ? ret : stripFormatting(ret);
	}

	getSummary (o) {
		let stats = this.stats;
		let ret = [];

		if (stats.pass > 0) {
			ret.push(`<c green><b>${ stats.pass }</b>/${ stats.total } PASS</c>`);
		}

		if (stats.fail > 0) {
			ret.push(`<c red><b>${ stats.fail }</b>/${ stats.total } FAIL</c>`);
		}

		if (stats.pending > 0) {
			ret.push(`<b>${ stats.pending }</b>/${ stats.total } remaining`);
		}

		let icon = stats.fail > 0? "❌" : stats.pending > 0? "⏳" : "✅";
		ret = [
			`${this.name ?? (this.test.level === 0? "<i>(All tests)</i>" : "")}`,
			icon,
			`${ ret.join(", ") }`,
			`<dim>(${ formatDuration(this.timeTaken ?? 0) })</dim>`
		].join(" ");

		return o?.format === "rich" ? ret : stripFormatting(ret);
	}

	toString (o) {
		let ret = [];

		if (this.test.isGroup) {
			ret.push(this.getSummary(o));
		}
		else if (this.pass === false || o?.verbose) {
			ret.push(this.getResult(o));
		}

		ret = ret.join("\n");

		if (this.tests) {
			ret = new String(ret);
			ret.children = this.tests.flatMap(t => t.toString(o)).filter(Boolean);
		}

		return ret;
	}
}