import logUpdate from 'log-update';
import { AsciiTree } from 'oo-ascii-tree';
import { globSync } from 'glob';
import path from 'path';

import Test from "./classes/Test.js";
import TestResult from "./classes/TestResult.js";
import { getType } from '../util.js';

// Set up environment for Node
Test.warn = function (msg) {
	console.warn(msg);
};

TestResult.warn = function (msg) {
	console.warn(msg);
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
		let messages = ret.toString({ format: "rich" });
		let tree = getTree(messages).toString(options);
		logUpdate(tree);
	});

	return ret.runAll();
}

