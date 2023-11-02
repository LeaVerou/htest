import * as check from "../../check.js";

export default class Test {
	data = {};

	constructor (test, parent) {
		if (!test) {
			console.warn("Empty test: ", test);
			return;
		}

		if (parent) {
			test.parent = parent;
			this.level = parent.level + 1;
		}
		else {
			this.level = 0;
		}

		Object.assign(this, test);
		Object.assign(this.data, this.parent?.data);

		this.originalName = this.name;

		if (typeof this.name === "function") {
			this.getName = this.name;
		}

		// Inherit properties from parent
		// This works recursively because the parent is ran before its children
		if (this.parent) {
			this.run ??= this.parent.run;
			this.map ??= this.parent.map;
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
		return !this.isGroup;
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
}