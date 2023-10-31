import logUpdate from 'log-update';
import chalk from 'chalk';
import { AsciiTree } from 'oo-ascii-tree';
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob';
import path from 'path';

import Test from "./classes/Test.js";
import TestResult from "./classes/TestResult.js";
import { formats } from "./format-console.js";
import { getType } from '../util.js';

// Set up environment for Node
Test.warn = function (msg) {
	console.warn(msg);
};

TestResult.warn = function (msg) {
	console.warn(msg);
}

// Hook up chalk with formatting function

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
export default function run (test, options = {}) {
	if (getType(test) == "string") {
		Promise.all(globSync(test).flatMap(paths => {
			// Convert paths to imported modules
			paths = getType(paths) == "string" ? [paths] : paths;
			return paths.map(p => {
				p = path.join(process.cwd(), p);
				return import(p).then(m => m.default ?? m);
			});
		})).then(tests => {
			run(tests, options);
		});
		return;
	}

	if (Array.isArray(test)) {
		if (test.length === 1) {
			test = test[0];
		}
		else {
			return run ({tests: test}, options);
		}
	}

	if (!(test instanceof Test)) {
		test = new Test(test);
	}

	let ret = new TestResult(test);

	ret.addEventListener("done", e => {
		let messages = ret.toString();
		let tree = getTree(messages).toString(options);
		logUpdate(tree);
	});

	return ret.runAll();
}

