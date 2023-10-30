import * as check from "../../check.js";

let anonymousGroup = 0;

export default class Test {
	constructor (test, parent) {
		if (parent) {
			test.parent = parent;
			this.level = parent.level + 1;
		}
		else {
			this.level = 0;
		}

		Object.assign(this, test);
		this.originalName = this.name;

		if (typeof this.name === "function") {
			this.getName = this.name;
		}

		// Inherit properties from parent
		// This works recursively because the parent is ran before its children
		if (this.parent) {
			this.run ??= this.parent.run;
			this.map ?? this.parent.map;
			this.check ??= this.parent.check;
			this.getName ??= this.parent.getName;
		}

		// Single args don't need to be wrapped in an array
		if (this.args !== undefined && !Array.isArray(this.args)) {
			this.args = [this.args];
		}

		if (!this.name) {
			if (this.getName) {
				this.name = this.getName.apply(this, this.args);
			}
			else if (this.isTest) {
				this.name = test.args.length > 0 ? test.args[0] : "(No args)";
			}
		}

		if (!this.check) {
			this.check = check.equals;
		}

		if (this.isGroup) {
			this.tests = this.tests.map(t => t instanceof Test ? t : new Test(t, this));
		}
		else if (!this.isTest) {
			this.warn("Test has no tests and is not a test itself");
		}
	}

	get isTest () {
		return this.run && this.args?.length > 0;
	}

	get isGroup () {
		return this.tests?.length > 0;
	}

	get testCount () {
		let count = this.isTest? 1 : 0;

		if (this.tests) {
			count += this.tests.reduce((prev, current) => prev + current.testCount, 0);
		}

		return count;
	}

	warn (msg) {
		let message = `[${this.name}] ${msg}`;
		(this.warnings ??= []).push(message);

		if (this.constructor.warn) {
			this.constructor.warn(message);
		}
	}

	validate () {
		if (this.types) {
			// Already validated
			return;
		}

		let types = this.types = {
			throws: !!this.throws,
			expect: "expect" in this || (this.run && this.args),
			time: this.maxTime > 0 || this.maxTimeAsync > 0,
		};

		if (types.throws && types.expect) {
			this.warn(`Test has both an expect and a throws clause. Your test cannot be *both* throwing *and* returning a value. "expect" ignored for now.`);
		}

		if (types.time && (types.throws || types.expect)) {
			this.warn(`Do not combine time-based pass criteria with expect or throws clauses, as it makes it hard to interpret the results`);
		}

		if (!types.throws && !types.expect && !types.time) {
			this.warn(`Test appears to have no pass criteria. Did you forget to add an expect or throws clause?`);
		}
	}
}