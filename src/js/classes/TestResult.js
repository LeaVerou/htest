import BubblingEventTarget from "./BubblingEventTarget.js";
import format from "../format-console.js";
import { toPrecision, delay } from "../../util.js";

export default class TestResult extends BubblingEventTarget {
	pass;
	details = [];

	constructor(test, parent) {
		super();

		this.test = test;
		this.parent = parent;

		this.addEventListener("done", e => {
			let originalTarget = e.detail?.target ?? e.target;

			if (originalTarget.test.isTest) {
				if (originalTarget.pass) {
					this.stats.pass++;
				}
				else {
					this.stats.fail++;
				}

				this.stats.totalTime += originalTarget.timeTaken;

				if (originalTarget.timeTakenAsync) {
					this.stats.totalTimeAsync += originalTarget.timeTakenAsync;
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
			this.actual = this.test.run(...this.test.args);
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

		this.tests = this.test.tests?.map(t => new TestResult(t, this));

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
		test.validate();

		if (test.types.throws) {
			Object.assign(this, this.evaluateThrown());
		}
		else if (test.types.expect) {
			Object.assign(this, this.evaluateExpected());
		}

		if (test.types.time) {
			let ret = this.evaluateTimeTaken();
			this.pass &&= ret.pass;
			this.details.push(...ret.details);
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
					ret.details.push(`Expected error but ${ this.actual !== undefined? ` got ${ this.actual }` : "none was thrown" }`);
				}
			}
		}

		return ret;
	}

	evaluateExpected () {
		let test = this.test;
		let ret = {pass: true, details: []};

		if (test.map) {
			this.mapped = {
				actual: test.map(this.actual),
				expect: test.map(test.expect)
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
				ret.details.push(`Got ${this.actual}, expected ${test.expect}${ this.mapped? ` (${ this.mapped.actual } and ${ this.mapped.expect } mapped)` : "" }`);
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

	get prefix () {
		// let level = this.test.level;
		let ret = "";

		// if (level > 0) {
		// 	let indent = (this.isLast? "   " : "│  ").repeat(this.test.level - 1);

		// 	ret += indent + (this.isLast? "└──" : "├──");
		// }

		if (this.name) {
			ret += format("[", "dim") + this.name + format("] ", "dim");
		}

		return ret;
	}

	getResult () {
		let timeTaken = "";

		if (this.timeTaken > 0) {
			let ms = toPrecision(this.timeTaken, 1);
			timeTaken = format(` (${ms} ms)`, "dim");
		}

		let msg = `${ format(this.pass? "PASS" : "FAIL", "bold") }${ timeTaken }`;

		if (this.details?.length > 0) {
			msg += ": " + this.details.join(", ");
		}

		return this.prefix + format(msg, this.pass ? "green" : "red");
	}

	getSummary () {
		let stats = this.stats;
		let ret = [];

		if (stats.pass > 0) {
			ret.push(format(`${ format(stats.pass, "bold") }/${stats.total} PASS`, "green"));
		}

		if (stats.fail > 0) {
			ret.push(format(`${ format(stats.fail, "bold") }/${stats.total} FAIL`, "red"));
		}

		if (stats.pending > 0) {
			ret.push(`${ format(stats.pending, "bold") }/${stats.total} remaining`);
		}

		let timeTaken = "";
		if (stats.timeTaken > 0) {
			let ms = toPrecision(stats.timeTaken, 1);
			timeTaken = format(` (${ms} ms)`, "dim");
		}

		return this.prefix + ret.join(", ") + timeTaken;
	}

	toString (o) {
		let ret = [];

		if (this.test.isGroup) {
			ret.push(this.getSummary(o));
		}

		if (this.test.isTest && (this.pass === false || o?.verbose)) {
			ret.push(this.getResult(o));
		}

		ret = ret.join("\n");

		if (this.tests) {
			ret = new String(ret);
			ret.children = this.tests.flatMap(t => t.toString(o));
		}

		return ret;
	}
}