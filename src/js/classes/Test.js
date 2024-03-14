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

		this.data = Object.assign({}, this.parent?.data, this.data);
		this.originalName = this.name;

		if (typeof this.name === "function") {
			this.getName = this.name;
		}

		// Inherit properties from parent
		// This works recursively because the parent is ran before its children
		if (this.parent) {
			for (let prop of ["run", "map", "check", "getName", "args", "skip"]) {
				if (!(prop in this) && prop in this.parent) {
					this[prop] = this.parent[prop];
				}
			}
		}

		// Single args don't need to be wrapped in an array
		if ("arg" in this) {
			this.args = [this.arg];
		}
		else if (this.args !== undefined && !Array.isArray(this.args)) {
			this.args = [this.args];
		}

		if (!this.name) {
			if (this.getName) {
				this.name = this.getName.apply(this, this.args);
			}
			else if (this.isTest) {
				this.name = this.args.length > 0 ? this.args[0] : "(No args)";
			}
		}

		if (!this.check) {
			this.check = check.equals;
		}

		if (this.isGroup) {
			this.tests = this.tests.map(t => t instanceof Test ? t : new Test(t, this));
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

	static warn (...args) {
		console.warn("[hTest test]", ...args);
	}
}