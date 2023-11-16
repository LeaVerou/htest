import logUpdate from 'log-update';
import { AsciiTree } from 'oo-ascii-tree';
import { globSync } from 'glob';
import path from 'path';

import Test from "./classes/Test.js";
import TestResult from "./classes/TestResult.js";
import format from "./format-console.js";
import { getType } from '../util.js';

// Set up environment for Node
Test.warn = function (msg) {
	console.warn(msg);
};

TestResult.warn = function (msg) {
	console.warn(msg);
}

function getTree (msg, i) {
	return new AsciiTree(`</dim>${ msg }<dim>`, ...(msg.children?.map(getTree) ?? []));
}

/**
 * Run a test or group of tests in Node.js
 * @param {Test | object} test
 * @param {object} [options]
 * @param {"rich" | "plain"} [options.format] Format to use for output. Defaults to "rich"
 */
export default function run (test, options = {}) {
	if (getType(test) == "string") {
		// Glob provided, resolve to test(s)
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
		test = new Test(test, null, options);
	}

	let ret = new TestResult(test, null, options);

	ret.addEventListener("done", e => {
		let messages = ret.toString({ format: options.format ?? "rich" });
		let tree = getTree(messages).toString();
		tree = format(tree);
		logUpdate(tree);

		if (ret.stats.pending === 0) {
			logUpdate.clear();
			console.log(tree);
		}
	});

	return ret.runAll();
}