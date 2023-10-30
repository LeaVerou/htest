import logUpdate from 'log-update';
import chalk from 'chalk';
import { AsciiTree } from 'oo-ascii-tree';

import Test from "./classes/Test.js";
import TestResult from "./classes/TestResult.js";

// Set up environment for Node

Test.warn = function (msg) {
	console.warn(msg);
};

TestResult.warn = function (msg) {
	console.warn(msg);
}

// Hook up chalk with formatting function
import { formats } from "./format-console.js";
let modifiers = "red green yellow bold dim".split(" ");
for (let prop of modifiers) {
	formats[prop] = chalk[prop];
}

function getTree (msg) {
	return new AsciiTree(msg, ...(msg.children?.map(getTree) ?? []));
}

/**
 * Run a test or group of tests in Node.js
 * @param {Test | object} test
 */
export default function run (test) {
	if (!(test instanceof Test)) {
		test = new Test(test);
	}

	let ret = new TestResult(test);

	ret.addEventListener("done", e => {
		let messages = ret.toString();
		let tree = getTree(messages).toString();
		logUpdate(tree);
	});

	return ret.runAll();
}

